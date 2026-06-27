import { Separator } from "@/shared";
import { ServerAsideVoiceChannels } from "./ServerAsideVoiceChannels";
import { ServerAsideTextChannels } from "./ServerAsideTextChannels";
import { ServerAsideMembersList } from "./ServerAsideMembersList";
import { ServerAsideHeader } from "./ServerAsideHeader";
import { ServerAsideFooter } from "./ServerAsideFooter";

export const ServerAsideSection = () => {
  return (
    <aside className="bg-zinc-900 h-full px-2 pb-4 flex flex-col justify-between overflow-y-hidden">
      <div className="flex flex-col gap-3 overflow-auto scrollbar-none pt-4">
        <ServerAsideHeader />

        <Separator />

        <ServerAsideVoiceChannels />

        <Separator />

        <ServerAsideTextChannels />

        <Separator />

        <ServerAsideMembersList />
      </div>

      <div>
        <Separator />

        <ServerAsideFooter />
      </div>
    </aside>
  );
};
