import { Skeleton } from "@/shared/ui/skeleton";

export const BoardCanvasSkeleton = () => {
  return (
    <div className="h-full w-full p-4">
      <Skeleton className="h-full w-full bg-gray-800/50" />
    </div>
  );
};
