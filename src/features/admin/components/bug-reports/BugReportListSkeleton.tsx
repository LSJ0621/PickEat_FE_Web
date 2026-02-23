/**
 * 버그 제보 목록 스켈레톤 UI
 */

export const BugReportListSkeleton = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="w-full animate-pulse rounded-lg border border-border-default bg-bg-surface p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-6 w-16 rounded-full bg-bg-secondary" />
                <div className="h-6 w-16 rounded-full bg-bg-secondary" />
              </div>
              <div className="h-5 w-3/4 rounded bg-bg-secondary" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-bg-secondary" />
                <div className="h-4 w-5/6 rounded bg-bg-secondary" />
              </div>
              <div className="h-4 w-32 rounded bg-bg-secondary" />
            </div>
            <div className="h-5 w-5 flex-shrink-0 rounded bg-bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
};
