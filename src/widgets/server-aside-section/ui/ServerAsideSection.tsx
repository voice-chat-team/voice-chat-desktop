import { Suspense } from "react";

import { ServerAsideHeader } from "./ServerAsideHeader";
import { ServerAsideFooter } from "./ServerAsideFooter";
import { ServerAsideMembersListContainer } from "./ServerAsideMembersList";

import { SkeletonAsideSectionItem } from "./SkeletonAsideSectionItem";
import { ServerAsideTextChannelsContainer } from "./ServerAsideTextChannels";
import { ServerAsideBoardsContainer } from "./ServerAsideBoards";
import { ServerAsideVoiceChannelsContainer } from "./ServerAsideVoiceChannels";
import { Separator } from "@/shared";

export const ServerAsideSection = () => {
  return (
    <aside className="flex h-full flex-col justify-between overflow-y-hidden bg-surface-100">
      <ServerAsideHeader />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-2 py-3 scrollbar-none">
        <Suspense fallback={<SkeletonAsideSectionItem />}>
          <ServerAsideTextChannelsContainer />
        </Suspense>

        <Separator />

        <Suspense fallback={<SkeletonAsideSectionItem />}>
          <ServerAsideVoiceChannelsContainer />
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
