/**
 * 시간대별 히트맵 컴포넌트
 * 요일 x 시간 히트맵으로 활동 패턴 시각화
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HourlyAnalyticsResponse } from '@/types/admin-analytics';
import { Clock } from 'lucide-react';
import { useMemo } from 'react';

interface HourlyHeatmapProps {
  data: HourlyAnalyticsResponse;
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function HourlyHeatmap({ data }: HourlyHeatmapProps) {
  // 최대값 계산 (색상 강도 계산용)
  const maxCount = useMemo(
    () => Math.max(...data.byDayAndHour.map((item) => item.count)),
    [data.byDayAndHour]
  );

  // day와 hour로 데이터 찾기
  const getCount = (day: number, hour: number) => {
    const item = data.byDayAndHour.find((d) => d.day === day && d.hour === hour);
    return item?.count || 0;
  };

  // 카운트에 따른 색상 강도 계산
  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-slate-700/30';
    const intensity = (count / maxCount) * 100;
    if (intensity >= 80) return 'bg-blue-600';
    if (intensity >= 60) return 'bg-blue-500';
    if (intensity >= 40) return 'bg-blue-400';
    if (intensity >= 20) return 'bg-blue-300';
    return 'bg-blue-200';
  };

  // 피크타임 확인
  const isPeakTime = (day: number, hour: number) => {
    return data.peakTime.hour === hour && data.byDayAndHour.some((d) => d.day === day && d.hour === hour && d.count === data.peakTime.count);
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">시간대별 활동 히트맵</CardTitle>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Clock className="h-4 w-4" />
            <span>
              피크타임: {data.peakTime.hour}시 ({data.peakTime.count.toLocaleString()}건)
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* 시간 헤더 */}
          <div className="flex gap-1">
            <div className="w-8" />
            {HOURS.map((hour) => (
              <div key={hour} className="w-6 text-[10px] text-slate-400 text-center">
                {hour % 6 === 0 ? hour : ''}
              </div>
            ))}
          </div>

          {/* 히트맵 그리드 */}
          {DAYS.map((day, dayIndex) => (
            <div key={dayIndex} className="flex gap-1 items-center">
              <div className="w-8 text-xs text-slate-400">{day}</div>
              {HOURS.map((hour) => {
                const count = getCount(dayIndex, hour);
                const color = getHeatmapColor(count);
                const peak = isPeakTime(dayIndex, hour);

                return (
                  <div
                    key={hour}
                    className={`w-6 h-6 rounded ${color} ${peak ? 'ring-2 ring-yellow-400' : ''} transition-all hover:scale-110 cursor-pointer relative group`}
                    title={`${day}요일 ${hour}시: ${count}건`}
                  >
                    {peak && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* 범례 */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-400">
            <span>낮음</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 bg-slate-700/30 rounded" />
              <div className="w-4 h-4 bg-blue-200 rounded" />
              <div className="w-4 h-4 bg-blue-300 rounded" />
              <div className="w-4 h-4 bg-blue-400 rounded" />
              <div className="w-4 h-4 bg-blue-500 rounded" />
              <div className="w-4 h-4 bg-blue-600 rounded" />
            </div>
            <span>높음</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
