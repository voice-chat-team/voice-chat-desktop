import { Suspense } from "react";
import { Separator } from "@/shared";

import { ServerAsideHeader } from "./ServerAsideHeader";
import { ServerAsideFooter } from "./ServerAsideFooter";
import { ServerAsideMembersListContainer } from "./ServerAsideMembersList";

import { SkeletonAsideSectionItem } from "./SkeletonAsideSectionItem";
import { ServerAsideTextChannelsContainer } from "./ServerAsideTextChannels";
import { ServerAsideBoardsContainer } from "./ServerAsideBoards";
import { ServerAsideVoiceChannelsContainer } from "./ServerAsideVoiceChannels";

export const ServerAsideSection = () => {
  return (
    <aside className="bg-zinc-900 h-full px-2 pb-4 flex flex-col justify-between overflow-y-hidden">
      <div className="flex flex-col gap-3 overflow-auto scrollbar-none pt-4">
        <ServerAsideHeader />

        <Separator />

        <Suspense fallback={<SkeletonAsideSectionItem />}>
          <ServerAsideVoiceChannelsContainer />
        </Suspense>

        <Separator />

        <Suspense fallback={<SkeletonAsideSectionItem />}>
          <ServerAsideTextChannelsContainer />
        </Suspense>

        <Separator />

        <Suspense fallback={<SkeletonAsideSectionItem />}>
          <ServerAsideBoardsContainer />
        </Suspense>

        <Separator />

        <Suspense fallback={<SkeletonAsideSectionItem />}>
          <ServerAsideMembersListContainer />
        </Suspense>
      </div>

      <ServerAsideFooter />
    </aside>
  );
};
