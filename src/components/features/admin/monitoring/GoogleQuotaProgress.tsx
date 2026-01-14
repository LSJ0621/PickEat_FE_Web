/**
 * Google API 할당량 진행 상태 컴포넌트
 * Google CSE와 Google Places API의 할당량 사용 현황 표시
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GoogleCseStats, GooglePlacesStats } from '@/types/admin-monitoring';
import { AlertTriangle } from 'lucide-react';

interface GoogleQuotaProgressProps {
  cseData: GoogleCseStats;
  placesData: GooglePlacesStats;
}

export function GoogleQuotaProgress({ cseData }: GoogleQuotaProgressProps) {
  // Calculate quota usage percent from todayUsage and dailyQuota
  const quotaUsagePercent = cseData.dailyQuota > 0
    ? (cseData.todayUsage / cseData.dailyQuota) * 100
    : 0;

  const progressColor =
    quotaUsagePercent > 80
      ? 'bg-red-500'
      : quotaUsagePercent > 60
      ? 'bg-yellow-500'
      : 'bg-green-500';

  const showWarning = quotaUsagePercent > 80;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Google CSE 일일 할당량</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Warning Alert */}
        {showWarning && (
          <div className="bg-red-950/20 border border-red-600 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-400 font-semibold mb-1">할당량 경고</h4>
              <p className="text-sm text-slate-300">
                일일 할당량의 {quotaUsagePercent.toFixed(1)}%를 사용했습니다.
                사용량을 모니터링하세요.
              </p>
            </div>
          </div>
        )}

        {/* Usage Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">오늘 사용량</p>
            <p className="text-2xl font-bold text-white">{cseData.todayUsage.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">일일 할당량</p>
            <p className="text-2xl font-bold text-white">{cseData.dailyQuota.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">사용률</p>
            <p className="text-2xl font-bold text-white">{quotaUsagePercent.toFixed(1)}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>0</span>
            <span>{cseData.dailyQuota.toLocaleString()}</span>
          </div>
          <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${progressColor} transition-all duration-500`}
              style={{ width: `${Math.min(quotaUsagePercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Additional Stats */}
        <div className="pt-4 border-t border-slate-700 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-400 mb-1">전체 호출</p>
            <p className="text-white font-semibold">{cseData.totalCalls.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">성공률</p>
            <p className="text-white font-semibold">
              {cseData.successRate.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">평균 응답시간</p>
            <p className="text-white font-semibold">{cseData.avgResponseTimeMs}ms</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
