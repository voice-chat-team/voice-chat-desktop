package ru.voicechatapp.app

import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.Build
import android.os.Bundle
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
  private inner class AudioRouteBridge {
    @JavascriptInterface
    fun setSpeakerphoneOn(enabled: Boolean) {
      val audioManager = getSystemService(AUDIO_SERVICE) as AudioManager

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        if (enabled) {
          val speaker = audioManager.availableCommunicationDevices
            .firstOrNull { it.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER }
          if (speaker != null) audioManager.setCommunicationDevice(speaker)
        } else {
          audioManager.clearCommunicationDevice()
        }
      } else {
        @Suppress("DEPRECATION")
        audioManager.isSpeakerphoneOn = enabled
      }
    }
  }

  override fun onWebViewCreate(webView: WebView) {
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
