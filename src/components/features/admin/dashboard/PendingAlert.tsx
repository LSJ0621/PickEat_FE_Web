/**
 * 미처리 현황 알림 컴포넌트
 * 미확인 버그 리포트 및 긴급 처리가 필요한 항목을 강조 표시
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PendingAlertProps {
  unconfirmedCount: number;
  urgentCount: number;
}

export function PendingAlert({ unconfirmedCount, urgentCount }: PendingAlertProps) {
  const hasAlerts = unconfirmedCount > 0 || urgentCount > 0;

  if (!hasAlerts) {
    return null;
  }

  return (
    <Card className="bg-yellow-950/20 border border-yellow-600">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          미처리 현황
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {unconfirmedCount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-slate-300">미확인 버그 리포트</span>
              <span className={cn('font-bold', unconfirmedCount > 10 ? 'text-red-400' : 'text-yellow-400')}>
                {unconfirmedCount}건
              </span>
            </div>
          )}
          {urgentCount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-slate-300">긴급 처리 필요 (3일 이상 미처리)</span>
              <span className="font-bold text-red-400">{urgentCount}건</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
