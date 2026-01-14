/**
 * 설정 로딩 스켈레톤
 */

import { Skeleton } from '@/components/ui/skeleton';

export function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
        <Skeleton className="mb-4 h-6 w-48 bg-slate-700" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-slate-700" />
          <Skeleton className="h-10 w-full bg-slate-700" />
          <Skeleton className="h-10 w-full bg-slate-700" />
        </div>
      </div>
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
        <Skeleton className="mb-4 h-6 w-48 bg-slate-700" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-slate-700" />
          <Skeleton className="h-10 w-full bg-slate-700" />
        </div>
      </div>
    </div>
  );
}
