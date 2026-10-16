import { cn } from "@/shared";
import { CSSProperties, useMemo } from "react";

const BAR_COUNT = 56;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value: string) {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }

  return hash;
}

/**
 * Высоты столбиков (0..1), похожие на речь: несколько «слогов»-огибающих
 * поверх шума. Без seed — ровная тишина.
 */
function buildBars(seed: string, isQuiet: boolean) {
  const random = mulberry32(hashString(seed));
  const syllables = 3 + Math.floor(random() * 3);
  const phase = random() * Math.PI;

  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const x = i / (BAR_COUNT - 1);
    const envelope = Math.abs(Math.sin(x * Math.PI * syllables + phase));
    const fade = Math.sin(x * Math.PI) ** 0.6;
    const level = (0.35 + 0.65 * envelope) * fade * (0.55 + 0.45 * random());

    return isQuiet ? 0.06 + 0.04 * random() : Math.max(0.08, level);
  });
}

type VoiceprintProps = {
  seed: string;
  isQuiet?: boolean;
  className?: string;
};

export function Voiceprint({
  seed,
  isQuiet = false,
  className,
}: VoiceprintProps) {
  const bars = useMemo(() => buildBars(seed, isQuiet), [seed, isQuiet]);

  return (
    <div
      aria-hidden
      className={cn("flex h-20 items-center gap-[3px] sm:h-28", className)}
    >
      {bars.map((level, i) => (
        <span
          key={i}
          className="min-w-0 flex-1 origin-center rounded-full bg-brand motion-safe:animate-[voiceprint-rise_900ms_cubic-bezier(0.2,0.8,0.2,1)_both]"
          style={
            {
              height: `${level * 100}%`,
              opacity: 0.35 + level * 0.65,
              animationDelay: `${i * 14}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
