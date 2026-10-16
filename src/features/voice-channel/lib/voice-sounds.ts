import { useAudioSettingsStore, useVoiceStore } from "@/entities/voice";

export type VoiceSound = "join" | "leave";

type Tone = { frequency: number; delay: number; level: number };

/**
 * Звуки синтезируются, а не грузятся из файлов: два коротких округлых «буп»
 * в духе Discord. Вход — вверх по квинте, выход — та же пара вниз.
 */
const SOUNDS: Record<VoiceSound, Tone[]> = {
  join: [
    { frequency: 392, delay: 0, level: 0.85 }, // G4
    { frequency: 587.33, delay: 0.085, level: 1 }, // D5
  ],
  leave: [
    { frequency: 587.33, delay: 0, level: 1 },
    { frequency: 392, delay: 0.085, level: 0.85 },
  ],
};

/**
 * Обертоны: [кратность частоты, громкость, длина затухания в с]. Почти чистый
 * тон с тихой октавой сверху и щепоткой суб-октавы для теплоты — без
 * колокольного звона, звук мягкий и короткий.
 */
const PARTIALS: [multiplier: number, level: number, decay: number][] = [
  [0.5, 0.08, 0.35],
  [1, 1, 0.45],
  [2, 0.08, 0.2],
];

/**
 * «Подъезд» к ноте снизу: каждая нота начинается чуть ниже своей высоты
 * и за GLIDE_TIME доходит до неё — отсюда округлое «буп», а не «дзинь».
 */
const GLIDE_FROM = 0.9;
const GLIDE_TIME = 0.045;

/** Каждая нота — два голоса, расстроенные на ±центы и разведённые по каналам. */
const VOICES: [detuneCents: number, pan: number][] = [
  [-4, -0.3],
  [4, 0.3],
];

const PEAK_GAIN = 0.05;
const ATTACK = 0.015;

const REVERB_SECONDS = 0.9;
const REVERB_WET = 0.12;
const DRY = 0.9;

/** Несколько участников, зашедших почти одновременно, дают один звук, а не кашу. */
const MIN_INTERVAL_MS = 150;

type SinkableAudioContext = AudioContext & {
  setSinkId?: (sinkId: string) => Promise<void>;
};

type Graph = { context: SinkableAudioContext; input: AudioNode };

let graph: Graph | null = null;
let currentSinkId = "";
let lastPlayedAt = 0;

/**
 * Импульсный отклик «комнаты»: шум с экспоненциальным затуханием, свой
 * в каждом канале — отсюда ширина стереобазы у хвоста.
 */
const createImpulseResponse = (ctx: AudioContext) => {
  const length = Math.floor(ctx.sampleRate * REVERB_SECONDS);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);

  for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
    const data = impulse.getChannelData(channel);

    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3.5);
    }
  }

  return impulse;
};

/**
 * Общая цепочка, собирается один раз:
 * input → срез верхов → (сухой сигнал + реверберация) → компрессор → выход.
 */
const createGraph = (): Graph => {
  const context = new AudioContext() as SinkableAudioContext;

  const lowpass = context.createBiquadFilter();
  lowpass.type = "lowpass";
  // Низкий срез — звук приглушённый, «как за тканью», без звонких верхов.
  lowpass.frequency.value = 1800;
  lowpass.Q.value = 0.5;

  const dry = context.createGain();
  dry.gain.value = DRY;

  const reverb = context.createConvolver();
  reverb.buffer = createImpulseResponse(context);

  const wet = context.createGain();
  wet.gain.value = REVERB_WET;

  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.knee.value = 12;
  compressor.ratio.value = 4;

  lowpass.connect(dry).connect(compressor);
  lowpass.connect(reverb).connect(wet).connect(compressor);
  compressor.connect(context.destination);

  return { context, input: lowpass };
};

/**
 * Звук идёт в то же устройство вывода, что и голоса. setSinkId у AudioContext
 * есть только в Chromium (WebView2, Android WebView) — в WebKit звук уйдёт
 * в системное устройство по умолчанию.
 */
const getGraph = async () => {
  graph ??= createGraph();
  const { context } = graph;

  if (context.state === "suspended") await context.resume();

  const { outputDeviceId } = useAudioSettingsStore.getState().state;
  const sinkId = outputDeviceId === "default" ? "" : outputDeviceId;

  if (sinkId !== currentSinkId && typeof context.setSinkId === "function") {
    // Даже при ошибке (устройство отключили) больше не пытаемся — играем
    // в текущее, а не дёргаем setSinkId на каждый звук.
    currentSinkId = sinkId;
    await context.setSinkId(sinkId).catch(() => undefined);
  }

  return graph;
};

const playTone = ({ context, input }: Graph, tone: Tone) => {
  const start = context.currentTime + tone.delay;
  const voiceLevel = (PEAK_GAIN * tone.level) / VOICES.length;

  PARTIALS.forEach(([multiplier, partialLevel, decay]) => {
    const end = start + decay;
    const frequency = tone.frequency * multiplier;

    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(
      voiceLevel * partialLevel,
      start + ATTACK,
    );
    envelope.gain.exponentialRampToValueAtTime(0.0001, end);
    envelope.connect(input);

    VOICES.forEach(([detune, pan], index) => {
      const oscillator = context.createOscillator();
      const panner = context.createStereoPanner();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency * GLIDE_FROM, start);
      oscillator.frequency.exponentialRampToValueAtTime(
        frequency,
        start + GLIDE_TIME,
      );
      oscillator.detune.value = detune;
      panner.pan.value = pan;

      oscillator.connect(panner).connect(envelope);
      oscillator.start(start);
      oscillator.stop(end + 0.05);

      if (index === 0) {
        oscillator.onended = () => envelope.disconnect();
      }
    });
  });
};

/** Звук входа/выхода в голосовом канале. Ошибки не пробрасывает: это украшение. */
export const playVoiceSound = (sound: VoiceSound) => {
  // С включёнными «наушниками» молчим, как и голоса собеседников.
  if (useVoiceStore.getState().state.isDeafened) return;

  const now = performance.now();
  if (now - lastPlayedAt < MIN_INTERVAL_MS) return;
  lastPlayedAt = now;

  void getGraph()
    .then((ready) => SOUNDS[sound].forEach((tone) => playTone(ready, tone)))
    .catch((error) => console.error("Не удалось проиграть звук:", error));
};
