/**
 * 메뉴 분석 로딩 스켈레톤 컴포넌트
 * 데이터 로딩 중 표시되는 스켈레톤 UI
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function MenuAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* 추이 차트 스켈레톤 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-slate-700 rounded animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-16 bg-slate-700 rounded animate-pulse" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-700/50 rounded-lg p-3">
                <div className="h-3 w-20 bg-slate-600 rounded animate-pulse mb-2" />
                <div className="h-6 w-16 bg-slate-600 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-slate-700/30 rounded animate-pulse" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 히트맵 스켈레톤 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-6 w-40 bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-24 bg-slate-700 rounded animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-6 bg-slate-700/30 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 파이차트 스켈레톤 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="h-6 w-32 bg-slate-700 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex-1 h-[250px] bg-slate-700/30 rounded-full animate-pulse" />
              <div className="flex-1 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-slate-700/50 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 테이블 스켈레톤 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-slate-700 rounded animate-pulse" />
            <div className="flex gap-3">
              <div className="h-8 w-32 bg-slate-700 rounded animate-pulse" />
              <div className="h-8 w-24 bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-slate-600 rounded animate-pulse" />
                </div>
                <div className="h-4 w-16 bg-slate-600 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 키워드 클라우드 스켈레톤 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="h-6 w-32 bg-slate-700 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="min-h-[200px] flex flex-wrap gap-3 p-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="bg-slate-700 rounded animate-pulse"
                  style={{
                    width: `${60 + Math.random() * 80}px`,
                    height: `${20 + Math.random() * 20}px`,
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 지역 분석 스켈레톤 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="h-6 w-32 bg-slate-700 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-slate-700/30 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
