import { useGuildPermissions } from "@/entities/role";
import { useServerStore } from "@/entities/server";
import { ROUTES, Tooltip, TooltipContent, TooltipTrigger } from "@/shared";
import { Lock, Settings } from "lucide-react";
import { Suspense } from "react";
import { Link } from "react-router";

const ServerSettingsLink = ({ guildId }: { guildId: string }) => {
  const permissions = useGuildPermissions(guildId);

  if (!permissions.has("MANAGE_GUILD") && !permissions.has("MANAGE_ROLES")) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={ROUTES.SERVER_SETTINGS(guildId)}
          aria-label="Настройки сервера"
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-faint transition-colors outline-none hover:bg-surface-raised hover:text-text-primary focus-visible:bg-surface-raised focus-visible:text-text-primary"
        >
          <Settings className="size-4" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>Настройки сервера</p>
      </TooltipContent>
    </Tooltip>
  );
};

export const ServerAsideHeader = () => {
  const guild = useServerStore((s) => s.state.guild);

  if (!guild) return null;

  return (
    <div className="flex shrink-0 items-start gap-2 border-b border-border-subtle p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h1 className="flex items-center gap-2 truncate text-lg leading-6 font-bold text-text-primary">
          {!guild.isPublic && (
            <Lock size={15} className="shrink-0 text-text-faint" />
          )}
          <span className="truncate">{guild.name}</span>
        </h1>
        {guild.description && (
          <small className="truncate text-xs leading-4 font-medium text-text-muted">
            {guild.description}
          </small>
        )}
      </div>

      <Suspense fallback={null}>
        <ServerSettingsLink guildId={guild.id} />
      </Suspense>
    </div>
  );
};
