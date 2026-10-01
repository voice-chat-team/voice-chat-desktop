import { TooltipProvider } from "@/shared/ui/tooltip";
import { SideBarPanel } from "@/widgets";
import { Outlet } from "react-router";

export function SidebarLayout() {
  return (
    <div className="flex h-svh bg-surface-000 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <TooltipProvider>
        <SideBarPanel />
      </TooltipProvider>
      <main className="h-full min-w-0 w-full bg-card">
        <Outlet />
      </main>
    </div>
  );
}
