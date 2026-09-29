package ru.voicechatapp.app

import android.os.Bundle
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

  override fun onWebViewCreate(webView: WebView) {
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
