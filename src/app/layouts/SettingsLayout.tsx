import { useState, type ReactNode } from "react";
import { SettingsAsideSection } from "@/widgets/setting-aside-section";
import { ServerSettingsAsideSection } from "@/widgets/server-settings-aside-section";
import { Outlet, useLocation } from "react-router";
import { Pane, SplitPane } from "react-split-pane";
import { Menu } from "lucide-react";

import {
  Button,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  useIsMobile,
} from "@/shared";

type SettingsShellProps = {
  aside: ReactNode;
  title: string;
};

const MobileSettingsShell = ({ aside, title }: SettingsShellProps) => {
  const location = useLocation();
  const [openedAt, setOpenedAt] = useState<string | null>(null);

  const isOpen = openedAt === location.search;

  return (
    <div className="flex h-svh flex-col bg-surface-200 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex shrink-0 items-center gap-1 border-b border-border-subtle bg-surface-100 px-2 py-1.5">
        <Sheet
          open={isOpen}
          onOpenChange={(open) => setOpenedAt(open ? location.search : null)}
        >
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Меню настроек">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            showCloseButton={false}
            className="bg-surface-100 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
          >
            <SheetTitle className="sr-only">{title}</SheetTitle>
            {aside}
          </SheetContent>
        </Sheet>
        <span className="truncate text-sm font-semibold text-text-primary">
          {title}
        </span>
      </div>

      <main className="min-h-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
};

const SettingsShell = ({ aside, title }: SettingsShellProps) => {
  const isMobile = useIsMobile();

  if (isMobile) return <MobileSettingsShell aside={aside} title={title} />;

  return (
    <div className="flex h-svh">
      <SplitPane
        direction="horizontal"
        dividerStyle={{ backgroundColor: "var(--border-subtle)" }}
      >
        <Pane minSize={200} defaultSize={250} maxSize={500}>
          {aside}
        </Pane>
        <Pane>
          <main className="h-svh w-full bg-surface-200 p-4">
            <Outlet />
          </main>
        </Pane>
      </SplitPane>
    </div>
  );
};

export const SettingsLayout = () => (
  <SettingsShell aside={<SettingsAsideSection />} title="Настройки" />
);

export const ServerSettingsLayout = () => (
  <SettingsShell
    aside={<ServerSettingsAsideSection />}
    title="Настройки сервера"
  />
);
