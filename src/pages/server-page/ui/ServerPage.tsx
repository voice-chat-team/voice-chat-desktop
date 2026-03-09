import { ServerAsideSection } from "@/widgets";
import { SplitPane, Pane } from "react-split-pane";

function ServerPage() {
  return (
    <SplitPane
      direction="horizontal"
      dividerStyle={{
        backgroundColor: "oklch(1 0 0 / 5%)",
      }}
    >
      <Pane minSize={200} defaultSize={250} maxSize={500}>
        <ServerAsideSection />
      </Pane>
      <Pane>1</Pane>
    </SplitPane>
  );
}

export default ServerPage;
