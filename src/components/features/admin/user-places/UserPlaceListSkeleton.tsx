/**
 * 유저 가게 목록 스켈레톤 로딩 컴포넌트
 */

export function UserPlaceListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-lg border border-slate-700 bg-slate-900/50 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-full bg-slate-700"></div>
                <div className="h-5 w-20 rounded-full bg-slate-700"></div>
              </div>
              <div className="space-y-2">
                <div className="h-5 w-3/4 rounded bg-slate-700"></div>
                <div className="h-4 w-full rounded bg-slate-700"></div>
                <div className="h-4 w-1/2 rounded bg-slate-700"></div>
              </div>
              <div className="flex gap-4">
                <div className="h-3 w-32 rounded bg-slate-700"></div>
                <div className="h-3 w-24 rounded bg-slate-700"></div>
              </div>
            </div>
            <div className="h-5 w-5 rounded bg-slate-700"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
