import { Skeleton } from '@shared/ui/skeleton';

export const SkeletonCard = () => {
  return (
    <div className="rounded-2xl border border-border-default bg-bg-secondary/50 p-6">
      <div className="space-y-4">
        {/* 제목 스켈레톤 */}
        <Skeleton className="h-6 w-3/4 bg-bg-tertiary/50" />

        {/* 설명 스켈레톤 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-bg-tertiary/30" />
          <Skeleton className="h-4 w-5/6 bg-bg-tertiary/30" />
        </div>

        {/* 메타 정보 스켈레톤 */}
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-full bg-bg-tertiary/40" />
          <Skeleton className="h-8 w-20 rounded-full bg-bg-tertiary/40" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonCardList = ({ count = 3 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </>
  );
};
