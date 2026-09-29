import { useState } from "react";
import { SettingsAsideSection } from "@/widgets/setting-aside-section";
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

const MobileSettingsLayout = () => {
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
            <SheetTitle className="sr-only">Настройки</SheetTitle>
            <SettingsAsideSection />
          </SheetContent>
        </Sheet>
        <span className="text-sm font-semibold text-text-primary">
          Настройки
        </span>
      </div>

      <main className="min-h-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export const SettingsLayout = () => {
  const isMobile = useIsMobile();

  if (isMobile) return <MobileSettingsLayout />;

  return (
    <div className="flex h-svh">
      <SplitPane
        direction="horizontal"
        dividerStyle={{ backgroundColor: "var(--border-subtle)" }}
      >
        <Pane minSize={200} defaultSize={250} maxSize={500}>
          <SettingsAsideSection />
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
