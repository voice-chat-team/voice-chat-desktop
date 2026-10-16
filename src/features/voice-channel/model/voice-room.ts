import { useVoiceStore, useAudioSettingsStore } from "@/entities/voice";
import { voiceApi } from "@/shared";
import { playVoiceSound } from "../lib/voice-sounds";
import type {
  Participant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
} from "livekit-client";

/**
 * Единственный на всё приложение экземпляр Room, живущий вне React — по тому же
 * принципу, что и centrifugeClient. Голосовое подключение обязано переживать
 * переходы между серверами, каналами и страницами, поэтому оно не может висеть
 * на жизненном цикле какого-либо компонента.
 */
let room: Room | null = null;

/** Скрытый контейнер для <audio> удалённых участников. */
let audioContainer: HTMLDivElement | null = null;

const getAudioContainer = () => {
  if (audioContainer) return audioContainer;

  audioContainer = document.createElement("div");
  audioContainer.id = "livekit-audio";
  audioContainer.style.display = "none";
  document.body.appendChild(audioContainer);

  return audioContainer;
};

const applyDeafenToElements = (isDeafened: boolean) => {
  const container = getAudioContainer();

  container.querySelectorAll("audio").forEach((element) => {
    element.muted = isDeafened;
  });
};

type AndroidAudioBridge = { setSpeakerphoneOn(enabled: boolean): void };

/** Нативный мост из MainActivity.kt; вне Android-сборки его нет. */
const getAudioBridge = () =>
  (window as { AndroidAudio?: AndroidAudioBridge }).AndroidAudio;

export const hasSpeakerphoneControl = () => getAudioBridge() !== undefined;

const setSpeakerphone = (enabled: boolean) =>
  getAudioBridge()?.setSpeakerphoneOn(enabled);

type AndroidVoiceCallBridge = {
  start(channelName: string): void;
  stop(): void;
};

/**
 * Foreground-сервис Android: держит процесс и микрофон живыми при свёрнутом
 * приложении и показывает уведомление «Вы в голосовом канале».
 */
const getVoiceCallBridge = () =>
  (window as { AndroidVoiceCall?: AndroidVoiceCallBridge }).AndroidVoiceCall;

/** Переключатель «громкая связь ↔ разговорный динамик» для кнопки в панели. */
export const setSpeakerphoneEnabled = (enabled: boolean) => {
  setSpeakerphone(enabled);
  useVoiceStore.getState().actions.setSpeakerphone(enabled);
};

/**
 * Публичный адрес LiveKit — тот же, что в CSP. Нужен только для прогрева:
 * само подключение идёт по url из ответа /voice/join.
 */
const LIVEKIT_PREWARM_URL = "wss://livekit.voice-chat-app.ru";

/** Микрофон не удалось захватить или опубликовать, но в комнате мы остались. */
export class MicrophoneUnavailableError extends Error {
  constructor(readonly reason: unknown) {
    super("Не удалось включить микрофон");
    this.name = "MicrophoneUnavailableError";
  }
}

let livekitModule: Promise<typeof import("livekit-client")> | null = null;

/** Чанк livekit-client грузится один раз, повторные вызовы берут тот же промис. */
const loadLiveKit = () => {
  livekitModule ??= import("livekit-client").catch((error) => {
    livekitModule = null;
    throw error;
  });

  return livekitModule;
};

let isPrewarmed = false;

/**
 * Вызывается при наведении на голосовой канал: заранее грузит livekit-client
 * и прогревает DNS + TLS до сервера, чтобы клик не платил за это сам.
 */
export const prewarmVoiceConnection = async () => {
  if (isPrewarmed || room) return;
  isPrewarmed = true;

  try {
    const { Room: LiveKitRoom } = await loadLiveKit();
    await new LiveKitRoom().prepareConnection(LIVEKIT_PREWARM_URL);
  } catch {
    isPrewarmed = false;
  }
};

const audioCaptureOptions = () => ({
  deviceId: useAudioSettingsStore.getState().state.inputDeviceId,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
});

const createRoom = async (): Promise<Room> => {
  const { Room: LiveKitRoom, RoomEvent, Track } = await loadLiveKit();

  const { outputDeviceId } = useAudioSettingsStore.getState().state;

  const instance = new LiveKitRoom({
    audioCaptureDefaults: audioCaptureOptions(),
    audioOutput: {
      deviceId: outputDeviceId,
    },
  });

  const { actions } = useVoiceStore.getState();

  instance.on(
    RoomEvent.TrackSubscribed,
    (
      track: RemoteTrack,
      _publication: RemoteTrackPublication,
      _participant: Participant,
    ) => {
      if (track.kind !== Track.Kind.Audio) return;

      const element = track.attach();
      // Наушники могли быть выключены ещё до того, как участник заговорил.
      element.muted = useVoiceStore.getState().state.isDeafened;
      getAudioContainer().appendChild(element);
    },
  );

  instance.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
    track.detach().forEach((element) => element.remove());
  });

  instance.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
    actions.setSpeakingUserIds(speakers.map((speaker) => speaker.identity));
  });

  // Состояние микрофонов пересчитывается целиком по текущему составу комнаты,
  // а не накапливается по дельтам: так оно не рассыпается, если какое-то
  // событие потерялось при переподключении.
  const refreshMutedUserIds = () => {
    const muted: string[] = [];

    if (!instance.localParticipant.isMicrophoneEnabled) {
      muted.push(instance.localParticipant.identity);
    }

    instance.remoteParticipants.forEach((participant) => {
      if (!participant.isMicrophoneEnabled) muted.push(participant.identity);
    });

    actions.setMutedUserIds(muted);
  };

  instance.on(RoomEvent.TrackMuted, refreshMutedUserIds);
  instance.on(RoomEvent.TrackUnmuted, refreshMutedUserIds);
  instance.on(RoomEvent.TrackPublished, refreshMutedUserIds);
  instance.on(RoomEvent.TrackUnpublished, refreshMutedUserIds);
  instance.on(RoomEvent.LocalTrackPublished, refreshMutedUserIds);
  instance.on(RoomEvent.LocalTrackUnpublished, refreshMutedUserIds);
  instance.on(RoomEvent.ParticipantConnected, refreshMutedUserIds);
  instance.on(RoomEvent.ParticipantDisconnected, refreshMutedUserIds);

  // Только в установленном соединении: на переподключении LiveKit может
  // заново объявить уже сидевших в комнате, и звенело бы на каждого.
  const isConnected = () =>
    useVoiceStore.getState().state.status === "connected";

  instance.on(RoomEvent.ParticipantConnected, () => {
    if (isConnected()) playVoiceSound("join");
  });
  instance.on(RoomEvent.ParticipantDisconnected, () => {
    if (isConnected()) playVoiceSound("leave");
  });

  instance.on(RoomEvent.Reconnecting, () => actions.setReconnecting());
  instance.on(RoomEvent.Reconnected, () => {
    actions.setConnected();
    refreshMutedUserIds();
  });

  // Сюда попадаем только при неожиданном обрыве: при выходе пользователя
  // слушатели снимаются до disconnect().
  instance.on(RoomEvent.Disconnected, () => {
    if (room !== instance) return;

    room = null;
    attempt += 1;
    // До сброса стора: playVoiceSound смотрит, не включены ли «наушники».
    playVoiceSound("leave");
    resetVoiceState();
  });

  return instance;
};

/**
 * Номер текущей попытки подключения. Выход или новое подключение увеличивают
 * его, и все ещё не завершённые шаги старой попытки видят, что устарели, и не
 * трогают ни стор, ни новую комнату.
 */
let attempt = 0;

const resetVoiceState = () => {
  getAudioContainer().replaceChildren();
  setSpeakerphone(false);
  getVoiceCallBridge()?.stop();
  useVoiceStore.getState().actions.setDisconnected();
};

/**
 * Все операции с микрофоном идут строго по очереди. Иначе быстрые клики или
 * клик во время публикации трека пересекаются внутри LiveKit, и микрофон
 * остаётся не в том состоянии, что показывает кнопка.
 */
let micQueue: Promise<void> = Promise.resolve();

const enqueueMic = (task: () => Promise<void>) => {
  const run = micQueue.then(task);
  // Упавшая операция не должна блокировать следующие.
  micQueue = run.catch(() => undefined);
  return run;
};

/** Приводит микрофон в LiveKit к состоянию кнопки из стора. */
const syncMicrophone = () =>
  enqueueMic(async () => {
    const current = room;
    if (!current) return;

    const enabled = !useVoiceStore.getState().state.isMicMuted;
    if (current.localParticipant.isMicrophoneEnabled === enabled) return;

    await current.localParticipant.setMicrophoneEnabled(enabled);
  });

export const connectToVoiceChannel = async (
  guildId: string,
  channelId: string,
  channelName: string,
) => {
  const { state, actions } = useVoiceStore.getState();

  if (state.channelId === channelId && state.status !== "idle") return;

  // Переход между каналами — это разрыв и новое подключение: одновременно
  // в двух голосовых каналах находиться нельзя. Обрывает и подключение,
  // которое ещё в процессе.
  // Без звука выхода: при переходе прозвучит только вход в новый канал.
  if (state.status !== "idle") {
    await disconnectFromVoiceChannel({ silent: true });
  }

  const currentAttempt = ++attempt;
  const isStale = () => attempt !== currentAttempt;

  actions.setConnecting(guildId, channelId, channelName);

  // Захват микрофона (на Windows запуск устройства занимает до секунды)
  // идёт параллельно с запросом токена и загрузкой livekit-client.
  // Ошибку микрофона не роняем сразу: без него в канале всё равно можно слушать.
  const microphoneTrack = loadLiveKit()
    .then(({ createLocalAudioTrack }) =>
      createLocalAudioTrack(audioCaptureOptions()),
    )
    .then(
      (track) => ({ track, error: null }),
      (error: unknown) => ({ track: null, error }),
    );

  const releaseMicrophone = () =>
    void microphoneTrack.then(({ track }) => track?.stop());

  let instance: Room;

  try {
    const [{ data }, created] = await Promise.all([
      voiceApi.voiceControllerJoinVoiceChannel({ guildId, channelId }),
      createRoom(),
    ]);

    instance = created;

    // Пока ждали токен, пользователь уже вышел или ушёл в другой канал.
    if (isStale()) {
      releaseMicrophone();
      return;
    }

    room = instance;
    await instance.connect(data.url, data.token);
  } catch (error) {
    releaseMicrophone();

    // Устаревшую попытку уже убрал disconnectFromVoiceChannel — трогать стор
    // нельзя, там может быть уже новое подключение.
    if (isStale()) return;

    await disconnectFromVoiceChannel();
    throw error;
  }

  if (isStale()) {
    releaseMicrophone();
    return;
  }

  // Комната подключена — дальше только микрофон, статус не держим.
  actions.setConnected();
  playVoiceSound("join");

  // Политика автовоспроизведения: вызываем в цепочке от клика пользователя,
  // иначе звук удалённых участников может не начать играть.
  void instance.startAudio();

  const { track, error } = await microphoneTrack;

  try {
    // Публикация стоит в общей очереди с кликами по кнопке микрофона.
    await enqueueMic(async () => {
      if (isStale()) throw new Error("stale");
      if (!track) throw error;

      await instance.localParticipant.publishTrack(track);
    });

    // Микрофон могли выключить (или включить наушники), пока трек публиковался.
    await syncMicrophone();
  } catch (publishError) {
    track?.stop();

    if (isStale()) return;

    actions.setMicMuted(true);
    throw new MicrophoneUnavailableError(publishError);
  }

  if (isStale()) return;

  // Режим звонка включается при захвате микрофона, поэтому выбираем
  // динамик только после него.
  setSpeakerphone(useVoiceStore.getState().state.isSpeakerphone);

  // После захвата микрофона: foreground-сервис с типом microphone нельзя
  // стартовать без выданного RECORD_AUDIO.
  getVoiceCallBridge()?.start(channelName);
};

/**
 * Состояние сбрасывается сразу, а сам разрыв с сервером идёт следом: кнопка
 * «Отключиться» срабатывает мгновенно, даже если сеть подвисла и disconnect()
 * отвечает долго или падает.
 */
export const disconnectFromVoiceChannel = async ({ silent = false } = {}) => {
  const current = room;
  room = null;
  attempt += 1;

  // Отмена ещё не состоявшегося подключения выходом не считается.
  const { status } = useVoiceStore.getState().state;
  if (!silent && (status === "connected" || status === "reconnecting")) {
    playVoiceSound("leave");
  }

  // До disconnect(): иначе событие Disconnected этой комнаты, пришедшее
  // позже, сбросило бы уже новое подключение.
  current?.removeAllListeners();
  resetVoiceState();

  try {
    await current?.disconnect();
  } catch (error) {
    console.error("Ошибка при отключении от комнаты LiveKit:", error);
  }
};

/**
 * Кнопка меняется сразу, LiveKit догоняет через очередь. Если включить
 * микрофон не вышло, кнопка возвращается к реальному состоянию.
 */
export const setMicrophoneMuted = async (isMicMuted: boolean) => {
  const { state, actions } = useVoiceStore.getState();

  if (state.status === "idle") return;

  actions.setMicMuted(isMicMuted);

  try {
    await syncMicrophone();
  } catch (error) {
    if (room) actions.setMicMuted(!room.localParticipant.isMicrophoneEnabled);
    throw error;
  }
};

/**
 * «Наушники» глушат только воспроизведение. Микрофон при этом тоже выключается,
 * как в Discord: странно слышать собеседника молчащим и продолжать вещать ему.
 */
export const setDeafened = async (isDeafened: boolean) => {
  const { actions } = useVoiceStore.getState();

  applyDeafenToElements(isDeafened);
  actions.setDeafened(isDeafened);

  if (isDeafened) {
    await setMicrophoneMuted(true);
  }
};

export type AudioDeviceKind = "audioinput" | "audiooutput";

/**
 * Выбор устройства из настроек. Вне звонка просто запоминаем его — createRoom
 * подхватит при следующем подключении. В звонке переключаем на лету: LiveKit
 * перезахватит микрофон
 */
export const selectAudioDevice = async (
  kind: AudioDeviceKind,
  deviceId: string,
) => {
  if (room) {
    const switched = await room.switchActiveDevice(kind, deviceId);

    if (!switched) {
      throw new Error(`Не удалось переключиться на устройство ${deviceId}`);
    }
  }

  const { actions } = useAudioSettingsStore.getState();

  if (kind === "audioinput") {
    actions.setInputDeviceId(deviceId);
  } else {
    actions.setOutputDeviceId(deviceId);
  }
};
