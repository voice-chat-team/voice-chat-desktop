import {
  ServerAsideList,
  ServerAsideListItem,
  ServerAsideListItemHeader,
  ServerAsideListTitle,
  ServerAsideUnorderList,
} from "@/features";
import { Skeleton } from "@/shared/ui/skeleton";

const SKELETON_ITEMS = [1, 2, 3];

export const SkeletonAsideSectionItem = () => {
  return (
    <ServerAsideList
      renderTitle={() => (
        <ServerAsideListTitle className="uppercase">
          <Skeleton className="w-full mr-4 h-5 bg-gray-800/50" />
        </ServerAsideListTitle>
      )}
      renderTitleButton={() => <Skeleton className="w-5 h-5 bg-gray-800/50" />}
      renderList={() => (
        <ServerAsideUnorderList>
          {SKELETON_ITEMS.map((k) => (
            <ServerAsideListItem
              className="hover:bg-transparent cursor-default py-1"
              key={k}
            >
              <ServerAsideListItemHeader>
                <ServerAsideListTitle>
                  <Skeleton className="w-full h-5 bg-gray-800/50" />
                </ServerAsideListTitle>
              </ServerAsideListItemHeader>
            </ServerAsideListItem>
          ))}
        </ServerAsideUnorderList>
      )}
    />
  );
};
