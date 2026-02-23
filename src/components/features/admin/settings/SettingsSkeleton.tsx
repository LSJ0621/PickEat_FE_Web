/**
 * 설정 로딩 스켈레톤
 */

import { Skeleton } from '@/components/ui/skeleton';

export function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border-default bg-bg-surface p-6">
        <Skeleton className="mb-4 h-6 w-48 bg-bg-secondary" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-bg-secondary" />
          <Skeleton className="h-10 w-full bg-bg-secondary" />
          <Skeleton className="h-10 w-full bg-bg-secondary" />
        </div>
      </div>
      <div className="rounded-lg border border-border-default bg-bg-surface p-6">
        <Skeleton className="mb-4 h-6 w-48 bg-bg-secondary" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-bg-secondary" />
          <Skeleton className="h-10 w-full bg-bg-secondary" />
        </div>
      </div>
    </div>
  );
}
