import {
  createAbbr,
  getAvatarColorClass,
  ROUTES,
  useUserServers,
} from "@/shared";
import { Skeleton } from "@/shared/ui/skeleton";
import { NavLink } from "react-router";

const listClass = "grid grid-cols-1 gap-1 sm:grid-cols-2 2xl:grid-cols-3";

export function WelcomeServerListSkeleton() {
  return (
    <ul className={listClass}>
      {Array.from({ length: 4 }, (_, i) => (
        <li key={i} className="flex items-center gap-3 px-2 py-2.5">
          <Skeleton className="size-10 shrink-0 rounded-squircle" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function WelcomeServerList() {
  const { data: guilds } = useUserServers();

  if (!guilds?.length) {
    return (
      <p className="max-w-md text-sm leading-relaxed text-text-secondary">
        Здесь пока тихо. Создайте свой сервер или примите приглашение — оно
        придёт в уведомления.
      </p>
    );
  }

  return (
    <ul className={listClass}>
      {guilds.map((guild) => (
        <li key={guild.id}>
          <NavLink
            to={ROUTES.SERVER(guild.id)}
            className="group flex min-h-14 items-center gap-3 rounded-lg px-2 py-2.5 outline-none transition-colors hover:bg-surface-raised focus-visible:bg-surface-raised focus-visible:ring-2 focus-visible:ring-brand"
          >
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-text-on-brand transition-[border-radius] duration-150 select-none group-hover:rounded-squircle group-focus-visible:rounded-squircle ${getAvatarColorClass(guild.id)}`}
            >
              {createAbbr(guild.name, 2)}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[15px] font-medium text-text-primary">
                {guild.name}
              </span>
              <span className="truncate text-[13px] text-text-muted">
                {guild.description ||
                  (guild.isPublic ? "Открытый сервер" : "Закрытый сервер")}
              </span>
            </span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
