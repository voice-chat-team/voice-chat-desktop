package ru.voicechatapp.app

import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.activity.OnBackPressedCallback
import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
  // Стандартный обработчик WryActivity, когда у WebView нет истории, вызывает
  // onBackPressed() и уничтожает Activity. Rust-потоки при этом продолжают
  // работать и падают на уже уничтоженных мьютексах (FORTIFY:
  // pthread_mutex_lock called on a destroyed mutex). Поэтому на корневом
  // экране приложение сворачивается, как это делают мессенджеры, а не
  // закрывается.
  override val handleBackNavigation: Boolean = false

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }

  // WebView при getUserMedia переводит AudioManager в MODE_IN_COMMUNICATION, и
  // WebRTC по умолчанию играет в разговорный динамик (как при звонке). Выбрать
  // выход из JS нельзя: setSinkId в Android WebView не поддерживается, поэтому
  // маршрутизацию переключаем нативно.
  //
  // Chromium выбирает устройство уже после нашего вызова — когда стартует
  // воспроизведение первой удалённой дорожки, — и перебивает наш выбор. Поэтому
  // помимо разового вызова на Android 12+ следим за сменой устройства и
  // возвращаем динамик, если система снова выбрала разговорный.
  private inner class AudioRouteBridge {
    private var speakerWanted = false
    private var deviceListener: AudioManager.OnCommunicationDeviceChangedListener? = null
    private var modeListener: AudioManager.OnModeChangedListener? = null

    private val handler = Handler(Looper.getMainLooper())

    // Android 11 и ниже: слушателей нет, поэтому раз в секунду сверяем состояние.
    private val pollRoute = object : Runnable {
      override fun run() {
        if (!speakerWanted) return

        @Suppress("DEPRECATION")
        if (!audioManager.isSpeakerphoneOn) applyRoute()

        handler.postDelayed(this, 1000)
      }
    }

    private val audioManager get() = getSystemService(AUDIO_SERVICE) as AudioManager

    @JavascriptInterface
    fun setSpeakerphoneOn(enabled: Boolean) {
      speakerWanted = enabled
      applyRoute()

      if (enabled) watchRoute() else unwatchRoute()
    }

    private fun applyRoute() {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        if (speakerWanted) {
          val speaker = audioManager.availableCommunicationDevices
            .firstOrNull { it.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER }
          if (speaker != null) audioManager.setCommunicationDevice(speaker)
        } else {
          audioManager.clearCommunicationDevice()
        }
      } else {
        @Suppress("DEPRECATION")
        audioManager.isSpeakerphoneOn = speakerWanted
      }
    }

    private fun watchRoute() {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
        handler.removeCallbacks(pollRoute)
        handler.postDelayed(pollRoute, 1000)
        return
      }

      if (deviceListener != null) return

      // Возвращаем только с разговорного динамика: если пользователь подключил
      // наушники или Bluetooth, его выбор не трогаем.
      val onDevice = AudioManager.OnCommunicationDeviceChangedListener { device ->
        if (speakerWanted && device?.type == AudioDeviceInfo.TYPE_BUILTIN_EARPIECE) {
          applyRoute()
        }
      }

      // Устройство может не «смениться», если Chromium просто включает режим
      // звонка и система сама берёт разговорный динамик, — ловим и смену режима.
      val onMode = AudioManager.OnModeChangedListener { mode ->
        if (speakerWanted && mode == AudioManager.MODE_IN_COMMUNICATION) applyRoute()
      }

      audioManager.addOnCommunicationDeviceChangedListener(mainExecutor, onDevice)
      audioManager.addOnModeChangedListener(mainExecutor, onMode)
      deviceListener = onDevice
      modeListener = onMode
    }

    private fun unwatchRoute() {
      handler.removeCallbacks(pollRoute)

      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return

      deviceListener?.let { audioManager.removeOnCommunicationDeviceChangedListener(it) }
      modeListener?.let { audioManager.removeOnModeChangedListener(it) }
      deviceListener = null
      modeListener = null
    }
  }

  private inner class VoiceCallBridge {
    @JavascriptInterface
    fun start(channelName: String) {
      // Пока приложение на экране, старт разрешён; если система всё же
      // откажет, голос просто останется без фонового режима.
      try {
        VoiceCallService.start(this@MainActivity, channelName)
      } catch (error: RuntimeException) {
        Log.w("VoiceCallBridge", "Не удалось запустить foreground-сервис", error)
      }
    }

    @JavascriptInterface
    fun stop() = VoiceCallService.stop(this@MainActivity)
  }

  override fun onWebViewCreate(webView: WebView) {
    webView.addJavascriptInterface(VoiceCallBridge(), "AndroidVoiceCall")
    webView.addJavascriptInterface(AudioRouteBridge(), "AndroidAudio")

    onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
      override fun handleOnBackPressed() {
        if (webView.canGoBack()) {
          webView.goBack()
        } else {
          moveTaskToBack(true)
        }
      }
    })
  }
}
