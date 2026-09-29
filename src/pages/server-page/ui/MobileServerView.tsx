import { Suspense, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, Users } from "lucide-react";

import { useServerStore } from "@/entities/server";
import {
  Button,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/shared";
import {
  ServerAsideMembersListContainer,
  ServerAsideSection,
} from "@/widgets";

import { ServerActiveView } from "./ServerActiveView";

// Метка в history.state, по которой видно, что открыт экран «контент».
// Открытие канала кладёт запись в историю, поэтому системный жест «назад»
// на Android (WebView.goBack) возвращает к списку каналов, а не закрывает
// приложение. Loader страницы отдаёт гильдию из кэша TanStack Query, так что
// навигация на тот же URL не пересоздаёт её и не сбрасывает выбор.
const MOBILE_VIEW_STATE = "serverMobileView";

export const MobileServerView = () => {
  const guildName = useServerStore((s) => s.state.guild?.name);
  const resetActiveView = useServerStore((s) => s.actions.resetActiveView);
  const hasActiveView = useServerStore(
    (s) =>
      !!(
        s.state.activeTextChannel ||
        s.state.activeBoard ||
        s.state.activeVoiceChannel
      ),
  );

  const location = useLocation();
  const navigate = useNavigate();
  const isInViewEntry =
    (location.state as Record<string, unknown> | null)?.[MOBILE_VIEW_STATE] ===
    true;

  const prevHasActiveView = useRef(hasActiveView);
  const prevIsInViewEntry = useRef(isInViewEntry);

  // Канал выбран в списке → кладём запись в историю.
  // Вьюху закрыли не через «назад» (например, вышли из голосового) → снимаем
  // эту запись, чтобы следующий «назад» не был пустым.
  useEffect(() => {
    const opened = !prevHasActiveView.current && hasActiveView;
    const closed = prevHasActiveView.current && !hasActiveView;
    prevHasActiveView.current = hasActiveView;

    if (opened && !isInViewEntry) {
      navigate(
        { pathname: location.pathname, search: location.search },
        { state: { [MOBILE_VIEW_STATE]: true } },
      );
    } else if (closed && isInViewEntry) {
      navigate(-1);
    }
  }, [hasActiveView, isInViewEntry, location, navigate]);

  // Ушли с записи назад → закрываем вьюху.
  useEffect(() => {
    const left = prevIsInViewEntry.current && !isInViewEntry;
    prevIsInViewEntry.current = isInViewEntry;

    if (left) resetActiveView();
  }, [isInViewEntry, resetActiveView]);

  return (
    <>
      <ServerAsideSection />

      {hasActiveView && (
        <div className="fixed inset-0 z-40 flex flex-col bg-surface-200 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
          <div className="flex shrink-0 items-center gap-1 border-b border-border-subtle bg-surface-100 px-2 py-1.5">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Назад"
              onClick={() => (isInViewEntry ? navigate(-1) : resetActiveView())}
            >
              <ArrowLeft />
            </Button>

            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text-primary">
              {guildName}
            </span>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Участники">
                  <Users />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-surface-100 px-2 pt-[max(1rem,env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom)]"
              >
                <SheetTitle className="px-2">Участники</SheetTitle>
                <div className="min-h-0 flex-1 overflow-auto scrollbar-none">
                  <Suspense fallback={null}>
                    <ServerAsideMembersListContainer />
                  </Suspense>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="min-h-0 flex-1">
            <ServerActiveView />
          </div>
        </div>
      )}
    </>
  );
};
