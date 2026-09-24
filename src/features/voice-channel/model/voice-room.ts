import { useVoiceStore } from "@/entities/voice";
import { voiceApi } from "@/shared";
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
 *
 * Рантайм-импорт livekit-client заперт в этом модуле (~400 КБ): всё остальное
 * приложение обращается к голосу только через эти функции и `import type`.
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

const createRoom = async (): Promise<Room> => {
  const { Room: LiveKitRoom, RoomEvent, Track } = await import("livekit-client");

  const instance = new LiveKitRoom({
    audioCaptureDefaults: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
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

  instance.on(RoomEvent.Reconnecting, () => actions.setReconnecting());
  instance.on(RoomEvent.Reconnected, () => actions.setConnected());

  instance.on(RoomEvent.Disconnected, () => {
    getAudioContainer().replaceChildren();
    actions.setDisconnected();
  });

  return instance;
};

export const connectToVoiceChannel = async (
  guildId: string,
  channelId: string,
  channelName: string,
) => {
  const { state, actions } = useVoiceStore.getState();

  if (state.channelId === channelId && state.status !== "idle") return;

  // Переход между каналами — это разрыв и новое подключение: одновременно
  // в двух голосовых каналах находиться нельзя.
  if (room) await disconnectFromVoiceChannel();

  actions.setConnecting(guildId, channelId, channelName);

  try {
    const { data } = await voiceApi.voiceControllerJoinVoiceChannel({
      guildId,
      channelId,
    });

    room = await createRoom();

    await room.connect(data.url, data.token);
    await room.localParticipant.setMicrophoneEnabled(true);

    // Политика автовоспроизведения: вызываем после клика пользователя,
    // иначе звук удалённых участников может не начать играть.
    await room.startAudio();

    actions.setConnected();
  } catch (error) {
    await disconnectFromVoiceChannel();
    throw error;
  }
};

export const disconnectFromVoiceChannel = async () => {
  const current = room;
  room = null;

  if (current) {
    await current.disconnect();
    current.removeAllListeners();
  }

  getAudioContainer().replaceChildren();
  useVoiceStore.getState().actions.setDisconnected();
};

export const setMicrophoneMuted = async (isMicMuted: boolean) => {
  if (!room) return;

  await room.localParticipant.setMicrophoneEnabled(!isMicMuted);
  useVoiceStore.getState().actions.setMicMuted(isMicMuted);
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
