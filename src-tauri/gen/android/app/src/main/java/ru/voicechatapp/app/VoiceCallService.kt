package ru.voicechatapp.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder

// Foreground-сервис не даёт Android усыпить процесс, пока пользователь в
// голосовом канале: без него при сворачивании приложения система отбирает
// микрофон у WebView и звук обрывается. Заодно сервис обязан показывать
// уведомление в шторке — это требование платформы.
class VoiceCallService : Service() {
  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val channelName = intent?.getStringExtra(EXTRA_CHANNEL_NAME).orEmpty()

    createChannel()
    val notification = buildNotification(channelName)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      startForeground(
        NOTIFICATION_ID,
        notification,
        ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE,
      )
    } else {
      startForeground(NOTIFICATION_ID, notification)
    }

    return START_NOT_STICKY
  }

  private fun createChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

    val manager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
    val channel = NotificationChannel(
      CHANNEL_ID,
      "Голосовой канал",
      NotificationManager.IMPORTANCE_LOW,
    ).apply { setShowBadge(false) }

    manager.createNotificationChannel(channel)
  }

  private fun buildNotification(channelName: String): Notification {
    // Тап по уведомлению возвращает в уже запущенное приложение (singleTask).
    val openApp = PendingIntent.getActivity(
      this,
      0,
      Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
      PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
    )

    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, CHANNEL_ID)
    } else {
      @Suppress("DEPRECATION")
      Notification.Builder(this)
    }

    return builder
      .setSmallIcon(android.R.drawable.stat_sys_phone_call)
      .setContentTitle("Вы в голосовом канале")
      .setContentText(channelName.ifEmpty { "Голосовой чат активен" })
      .setContentIntent(openApp)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setCategory(Notification.CATEGORY_CALL)
      .build()
  }

  companion object {
    private const val CHANNEL_ID = "voice_call"
    private const val NOTIFICATION_ID = 7001
    private const val EXTRA_CHANNEL_NAME = "channelName"

    fun start(context: Context, channelName: String) {
      val intent = Intent(context, VoiceCallService::class.java)
        .putExtra(EXTRA_CHANNEL_NAME, channelName)

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    }

    fun stop(context: Context) {
      context.stopService(Intent(context, VoiceCallService::class.java))
    }
  }
}
