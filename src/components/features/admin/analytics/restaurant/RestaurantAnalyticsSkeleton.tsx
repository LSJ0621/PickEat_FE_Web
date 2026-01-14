/**
 * 음식점 통계 로딩 스켈레톤 컴포넌트
 * 데이터 로딩 중 표시되는 스켈레톤 UI
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function RestaurantAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* 검색량 추이 차트 스켈레톤 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="h-6 w-32 bg-slate-700 rounded animate-pulse mb-2" />
              <div className="flex gap-4">
                <div className="h-4 w-48 bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-48 bg-slate-700 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-16 bg-slate-700 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-slate-700/30 rounded animate-pulse" />
        </CardContent>
      </Card>

      {/* 검색 키워드 테이블 스켈레톤 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="h-6 w-40 bg-slate-700 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
                <div className="flex gap-4 flex-1">
                  <div className="h-4 w-8 bg-slate-600 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-slate-600 rounded animate-pulse" />
                </div>
                <div className="flex gap-4 items-center">
                  <div className="h-4 w-16 bg-slate-600 rounded animate-pulse" />
                  <div className="h-4 w-4 bg-slate-600 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-slate-600 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 지역별 검색 분포 차트 스켈레톤 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="h-6 w-40 bg-slate-700 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-slate-700/30 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 bg-slate-700/30 rounded"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-600 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-slate-600 rounded animate-pulse" />
                </div>
                <div className="h-4 w-12 bg-slate-600 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
