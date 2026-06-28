import { Suspense } from "react";
import { Separator } from "@/shared";
import { ServerAsideVoiceChannels } from "./ServerAsideVoiceChannels";
import { ServerAsideTextChannels } from "./ServerAsideTextChannels/ServerAsideTextChannels";
import { ServerAsideHeader } from "./ServerAsideHeader";
import { ServerAsideFooter } from "./ServerAsideFooter";
import { ServerAsideMembersListContainer } from "./ServerAsideMembersList";

import { SkeletonAsideSectionItem } from "./SkeletonAsideSectionItem";
import { ServerAsideTextChannelsContainer } from "./ServerAsideTextChannels";

export const ServerAsideSection = () => {
  return (
    <aside className="bg-zinc-900 h-full px-2 pb-4 flex flex-col justify-between overflow-y-hidden">
      <div className="flex flex-col gap-3 overflow-auto scrollbar-none pt-4">
        <ServerAsideHeader />

        {/*<Separator />

        <ServerAsideVoiceChannels />*/}

        <Separator />

        <Suspense fallback={<SkeletonAsideSectionItem />}>
          <ServerAsideTextChannelsContainer />
        </Suspense>

        <Separator />

        <Suspense fallback={<SkeletonAsideSectionItem />}>
          <ServerAsideMembersListContainer />
        </Suspense>
      </div>

      <div>
        <Separator />

        <ServerAsideFooter />
      </div>
    </aside>
  );
};
