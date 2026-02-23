/**
 * 관리자 대시보드 페이지
 * 전체 시스템 통계 및 최근 활동 요약 정보 제공
 */

import { useEffect, useState } from 'react';
import { adminService } from '@/api/services/admin';
import { DashboardSkeleton } from '@/components/features/admin/dashboard/DashboardSkeleton';
import { PendingAlert } from '@/components/features/admin/dashboard/PendingAlert';
import { RecentActivityList } from '@/components/features/admin/dashboard/RecentActivityList';
import { StatCard } from '@/components/features/admin/dashboard/StatCard';
import { TrendChart } from '@/components/features/admin/dashboard/TrendChart';
import type { DashboardSummary, RecentActivities, TrendData, TrendPeriod } from '@/types/admin';
import { extractErrorMessage, handleApiError } from '@/utils/error';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { AlertCircle, FileText, TrendingUp, Users } from 'lucide-react';

export function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivities | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Error handler
  const { handleError: showErrorToast } = useErrorHandler();

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchTrends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trendPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryData, activitiesData, trendsData] = await Promise.all([
        adminService.getDashboardSummary(),
        adminService.getRecentActivities(),
        adminService.getTrends(trendPeriod),
      ]);
      setSummary(summaryData);
      setRecentActivities(activitiesData);
      setTrends(trendsData);
    } catch (err) {
      const errorMessage = extractErrorMessage(err, '대시보드 데이터를 불러오는데 실패했습니다.');
      setError(errorMessage);
      handleApiError(err, 'AdminDashboardPage', showErrorToast);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async () => {
    try {
      const trendsData = await adminService.getTrends(trendPeriod);
      setTrends(trendsData);
    } catch (err) {
      const errorMessage = extractErrorMessage(err, '트렌드 데이터를 불러오는데 실패했습니다.');
      setError(errorMessage);
      handleApiError(err, 'AdminDashboardPage', showErrorToast);
    }
  };

  const handlePeriodChange = (period: TrendPeriod) => {
    setTrendPeriod(period);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-8">관리자 대시보드</h1>
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !summary || !recentActivities || !trends) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text-primary mb-2">데이터 로드 실패</h2>
            <p className="text-text-tertiary mb-4">{error || '데이터를 불러올 수 없습니다.'}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-brand-primary text-text-inverse rounded-lg hover:bg-orange-600 transition-colors"
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
        {/* 페이지 제목 */}
        <h1 className="text-3xl font-bold text-text-primary">관리자 대시보드</h1>

        {/* 오늘의 요약 */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-4">오늘의 요약</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="신규 가입자"
              value={summary.today.newUsers}
              icon={Users}
              description="오늘 가입한 사용자 수"
            />
            <StatCard
              title="메뉴 추천"
              value={summary.today.menuRecommendations}
              icon={TrendingUp}
              description="오늘 생성된 추천 수"
            />
            <StatCard
              title="버그 리포트"
              value={summary.today.bugReports}
              icon={FileText}
              description="오늘 접수된 리포트 수"
            />
          </div>
        </section>

        {/* 누적 통계 */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-4">누적 통계</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="총 사용자"
              value={summary.total.users.toLocaleString()}
              icon={Users}
              description="전체 가입 사용자 수"
            />
            <StatCard
              title="총 메뉴 추천"
              value={summary.total.menuRecommendations.toLocaleString()}
              icon={TrendingUp}
              description="전체 추천 수"
            />
            <StatCard
              title="총 버그 리포트"
              value={summary.total.bugReports.toLocaleString()}
              icon={FileText}
              description="전체 리포트 수"
            />
          </div>
        </section>

        {/* 미처리 현황 알림 */}
        <PendingAlert
          unconfirmedCount={summary.pending.unconfirmedBugReports}
          urgentCount={summary.pending.urgentBugReports}
        />

        {/* 추이 차트 */}
        <section>
          <TrendChart data={trends} period={trendPeriod} onPeriodChange={handlePeriodChange} />
        </section>

        {/* 최근 활동 */}
        <section>
          <RecentActivityList activities={recentActivities} />
        </section>
      </div>
    </div>
  );
}
