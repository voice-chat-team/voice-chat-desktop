import { SettingsAsideSection } from "@/widgets/setting-aside-section";
import { Outlet } from "react-router";
import { Pane, SplitPane } from "react-split-pane";

export const SettingsLayout = () => {
  return (
    <div className="flex">
      <SplitPane
        direction="horizontal"
        dividerStyle={{ backgroundColor: "oklch(1 0 0 / 5%)" }}
      >
        <Pane minSize={200} defaultSize={250} maxSize={500}>
          <SettingsAsideSection />
        </Pane>
        <Pane>
          <main className="h-svh w-full bg-card p-4">
            <Outlet />
          </main>
        </Pane>
      </SplitPane>
    </div>
  );
};
