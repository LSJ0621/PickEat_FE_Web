/**
 * 공지사항 목록 스켈레톤 로딩 컴포넌트
 */

export const NotificationListSkeleton = () => {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 animate-pulse"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-6 w-12 rounded-full bg-slate-700" />
                <div className="h-6 w-16 rounded-full bg-slate-700" />
              </div>
              <div className="h-5 w-3/4 rounded bg-slate-700" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-slate-700" />
                <div className="h-4 w-2/3 rounded bg-slate-700" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-3 w-32 rounded bg-slate-700" />
                <div className="h-3 w-20 rounded bg-slate-700" />
                <div className="h-3 w-36 rounded bg-slate-700" />
              </div>
            </div>
            <div className="h-5 w-5 rounded bg-slate-700" />
          </div>
        </div>
      ))}
    </div>
  );
};
