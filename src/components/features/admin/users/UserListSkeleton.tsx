/**
 * 사용자 목록 스켈레톤 컴포넌트
 */

export const UserListSkeleton = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-[var(--border-default)] bg-bg-surface p-4 animate-pulse"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-5 w-16 rounded-full bg-gray-200" />
                <div className="h-5 w-20 rounded-full bg-gray-200" />
                <div className="h-5 w-16 rounded-full bg-gray-200" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-48 rounded bg-gray-200" />
                <div className="h-4 w-32 rounded bg-gray-200" />
              </div>
              <div className="h-4 w-40 rounded bg-gray-200" />
            </div>
            <div className="h-5 w-5 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
};
