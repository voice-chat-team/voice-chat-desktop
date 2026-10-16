import { useVoiceStore } from "@/entities/voice";
import { Button, ROUTES } from "@/shared";
import { Volume2 } from "lucide-react";
import { Link } from "react-router";

/** Напоминание, что голосовое подключение живо, и быстрый путь обратно. */
export function WelcomeVoiceSession() {
  const guildId = useVoiceStore((store) => store.state.guildId);
  const channelName = useVoiceStore((store) => store.state.channelName);
  const status = useVoiceStore((store) => store.state.status);

  if (status === "idle" || !guildId) return null;

  const isLive = status === "connected";

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-border-subtle bg-surface-100 px-4 py-3">
      <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-status-online/15 text-status-online">
        <Volume2 size={18} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-[13px] text-text-muted">
          {isLive
            ? "Вы в голосовом канале"
            : "Подключение к голосовому каналу…"}
        </span>
        <span className="truncate text-[15px] font-medium text-text-primary">
          {channelName}
        </span>
      </div>
      <Button asChild variant="subtle" size="lg" className="max-sm:w-full">
        <Link to={ROUTES.SERVER(guildId)}>Вернуться в канал</Link>
      </Button>
    </div>
  );
}
