/**
 * 설정 로딩 스켈레톤
 */

import { Skeleton } from '@/components/ui/skeleton';

export function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--border-default)] bg-bg-surface p-6">
        <Skeleton className="mb-4 h-6 w-48 bg-gray-200" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-gray-200" />
          <Skeleton className="h-10 w-full bg-gray-200" />
          <Skeleton className="h-10 w-full bg-gray-200" />
        </div>
      </div>
      <div className="rounded-lg border border-[var(--border-default)] bg-bg-surface p-6">
        <Skeleton className="mb-4 h-6 w-48 bg-gray-200" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-gray-200" />
          <Skeleton className="h-10 w-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
