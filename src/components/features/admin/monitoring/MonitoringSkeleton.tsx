/**
 * 모니터링 페이지 로딩 스켈레톤
 * 데이터 로드 중 표시되는 스켈레톤 UI
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function MonitoringSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <div className="h-4 bg-slate-700 rounded w-24 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-700 rounded w-20 mb-2 animate-pulse" />
              <div className="h-3 bg-slate-700 rounded w-32 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Skeleton */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="h-5 bg-slate-700 rounded w-40 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-slate-700/50 rounded animate-pulse" />
        </CardContent>
      </Card>

      {/* Table Skeleton */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="h-5 bg-slate-700 rounded w-40 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-700/50 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
