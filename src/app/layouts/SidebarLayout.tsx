import { TooltipProvider } from "@/shared/ui/tooltip";
import { SideBarPanel } from "@/widgets";
import { Outlet } from "react-router";

export function SidebarLayout() {
  return (
    <div className="flex">
      <TooltipProvider>
        <SideBarPanel />
      </TooltipProvider>
      <main className="h-svh w-full bg-card p-2">
        <Outlet />
      </main>
    </div>
  );
}
