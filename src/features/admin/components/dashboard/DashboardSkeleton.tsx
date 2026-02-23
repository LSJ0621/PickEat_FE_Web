/**
 * 대시보드 로딩 스켈레톤 컴포넌트
 * 데이터 로딩 중 표시되는 스켈레톤 UI
 */

import { Card, CardContent, CardHeader } from '@shared/ui/card';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* 상단 통계 카드 스켈레톤 */}
      <div>
        <div className="h-6 w-32 bg-bg-secondary rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-bg-surface border-border-default">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="h-4 w-24 bg-bg-secondary rounded animate-pulse" />
                <div className="h-4 w-4 bg-bg-secondary rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-bg-secondary rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 중간 통계 카드 스켈레톤 */}
      <div>
        <div className="h-6 w-32 bg-bg-secondary rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-bg-surface border-border-default">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="h-4 w-24 bg-bg-secondary rounded animate-pulse" />
                <div className="h-4 w-4 bg-bg-secondary rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-bg-secondary rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 차트 스켈레톤 */}
      <Card className="bg-bg-surface border-border-default">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 w-24 bg-bg-secondary rounded animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-16 bg-bg-secondary rounded animate-pulse" />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-bg-secondary/50 rounded animate-pulse" />
        </CardContent>
      </Card>

      {/* 최근 활동 스켈레톤 */}
      <Card className="bg-bg-surface border-border-default">
        <CardHeader>
          <div className="h-6 w-24 bg-bg-secondary rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-bg-tertiary rounded animate-pulse" />
                  <div className="h-3 w-24 bg-bg-tertiary rounded animate-pulse" />
                </div>
                <div className="h-4 w-16 bg-bg-tertiary rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
