import { VoiceControlPanel } from "@/features";

export const ServerAsideFooter = () => {
  return (
    <div className="border-t border-border-subtle px-2 pb-4 empty:hidden">
      <VoiceControlPanel />
    </div>
  );
};
