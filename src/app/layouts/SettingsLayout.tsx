import { SettingsAsideSection } from "@/widgets/setting-aside-section";
import { Outlet } from "react-router";
import { Pane, SplitPane } from "react-split-pane";

export const SettingsLayout = () => {
  return (
    <div className="flex">
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
