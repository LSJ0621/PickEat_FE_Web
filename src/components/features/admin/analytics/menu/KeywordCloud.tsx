/**
 * 키워드 클라우드 컴포넌트
 * 인기 키워드를 크기별로 시각화
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { KeywordAnalyticsResponse } from '@/types/admin-analytics';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

interface KeywordCloudProps {
  data: KeywordAnalyticsResponse;
}

export function KeywordCloud({ data }: KeywordCloudProps) {
  // 최대/최소값 계산
  const maxCount = Math.max(...data.data.map((item) => item.count));
  const minCount = Math.min(...data.data.map((item) => item.count));

  // 폰트 크기 계산 (12px ~ 36px)
  const getFontSize = (count: number) => {
    if (maxCount === minCount) return 24;
    const ratio = (count - minCount) / (maxCount - minCount);
    return 12 + ratio * 24;
  };

  // 트렌드 아이콘
  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowUp className="h-3 w-3 text-green-400" />;
    if (trend === 'down') return <ArrowDown className="h-3 w-3 text-red-400" />;
    return <Minus className="h-3 w-3 text-slate-400" />;
  };

  // 트렌드 색상
  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-slate-400';
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">인기 키워드</CardTitle>
      </CardHeader>
      <CardContent>
        {data.data.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>데이터가 없습니다</p>
          </div>
        ) : (
          <>
            {/* 키워드 클라우드 */}
            <div className="flex flex-wrap gap-3 justify-center items-center min-h-[200px] p-4">
              {data.data.map((item) => {
                const fontSize = getFontSize(item.count);
                return (
                  <div
                    key={item.keyword}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-700/50 transition-all cursor-pointer"
                    style={{ fontSize: `${fontSize}px` }}
                    title={`${item.keyword}: ${item.count}건 (${item.changeRate > 0 ? '+' : ''}${item.changeRate.toFixed(1)}%)`}
                  >
                    <span className={`font-semibold ${getTrendColor(item.trend)}`}>{item.keyword}</span>
                    {getTrendIcon(item.trend)}
                  </div>
                );
              })}
            </div>

            {/* 상위 키워드 목록 */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-3">상위 10개 키워드</h4>
              <div className="grid grid-cols-2 gap-3">
                {data.data.slice(0, 10).map((item, index) => (
                  <div key={item.keyword} className="flex items-center justify-between bg-slate-700/30 rounded p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">{index + 1}</span>
                      <span className="text-sm text-white">{item.keyword}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-300">{item.count}</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(item.trend)}
                        <span className={`text-xs ${getTrendColor(item.trend)}`}>
                          {item.changeRate > 0 ? '+' : ''}
                          {item.changeRate.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
