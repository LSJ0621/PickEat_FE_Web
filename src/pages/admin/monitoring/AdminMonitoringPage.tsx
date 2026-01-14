/**
 * 관리자 시스템 모니터링 페이지
 * API 사용량, 이메일 통계, 스토리지 통계 모니터링
 */

import { useEffect, useState } from 'react';
import { adminMonitoringService } from '@/api/services/admin-monitoring';
import {
  ApiUsageSummaryCards,
  EmailStatsSection,
  GoogleQuotaProgress,
  MonitoringSkeleton,
  OpenAiDetailChart,
  StorageStatsSection,
} from '@/components/features/admin/monitoring';
import type {
  ApiUsageResponse,
  EmailStats,
  MonitoringPeriod,
  StorageStats,
} from '@/types/admin-monitoring';
import { extractErrorMessage, handleApiError } from '@/utils/error';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { AlertCircle } from 'lucide-react';

export function AdminMonitoringPage() {
  const [apiUsage, setApiUsage] = useState<ApiUsageResponse | null>(null);
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [period, setPeriod] = useState<MonitoringPeriod>('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Error handler
  const { handleError: showErrorToast } = useErrorHandler();

  useEffect(() => {
    fetchMonitoringData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [apiData, emailData, storageData] = await Promise.all([
        adminMonitoringService.getApiUsage(period),
        adminMonitoringService.getEmailStats(period),
        adminMonitoringService.getStorageStats(period),
      ]);
      setApiUsage(apiData);
      setEmailStats(emailData);
      setStorageStats(storageData);
    } catch (err) {
      const errorMessage = extractErrorMessage(err, '모니터링 데이터를 불러오는데 실패했습니다.');
      setError(errorMessage);
      handleApiError(err, 'AdminMonitoringPage', showErrorToast);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: MonitoringPeriod) => {
    setPeriod(newPeriod);
  };

  const periodOptions: Array<{ value: MonitoringPeriod; label: string }> = [
    { value: '7d', label: '7일' },
    { value: '30d', label: '30일' },
    { value: '90d', label: '90일' },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">시스템 모니터링</h1>
          <MonitoringSkeleton />
        </div>
      </div>
    );
  }

  if (error || !apiUsage || !emailStats || !storageStats) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-950/20 border border-red-600 rounded-lg p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">데이터 로드 실패</h2>
            <p className="text-slate-400 mb-4">{error || '데이터를 불러올 수 없습니다.'}</p>
            <button
              onClick={fetchMonitoringData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">시스템 모니터링</h1>
          <div className="flex gap-2">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePeriodChange(option.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  period === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* API Usage Summary */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">API 사용량 요약</h2>
          <ApiUsageSummaryCards data={apiUsage} />
        </section>

        {/* Google Quota */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Google API 할당량</h2>
          <GoogleQuotaProgress cseData={apiUsage.googleCse} placesData={apiUsage.googlePlaces} />
        </section>

        {/* OpenAI Details */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">OpenAI 상세 통계</h2>
          <OpenAiDetailChart data={apiUsage.openai} />
        </section>

        {/* Email Statistics */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">이메일 통계</h2>
          <EmailStatsSection data={emailStats} />
        </section>

        {/* Storage Statistics */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">스토리지 현황</h2>
          <StorageStatsSection data={storageStats} />
        </section>
      </div>
    </div>
  );
}
