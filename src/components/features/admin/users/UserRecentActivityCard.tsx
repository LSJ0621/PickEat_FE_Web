/**
 * 사용자 최근 활동 카드 컴포넌트
 */

import type { AdminUserDetail } from '@/types/admin';
import { Clock, MapPin, AlertCircle } from 'lucide-react';

interface UserRecentActivityCardProps {
  recentActivities: AdminUserDetail['recentActivities'];
}

export const UserRecentActivityCard = ({ recentActivities }: UserRecentActivityCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      UNCONFIRMED: { bg: 'bg-error-bg', text: 'text-error', label: '미확인' },
      CONFIRMED: { bg: 'bg-success-bg', text: 'text-success', label: '확인' },
    };

    const badge = badges[status] || { bg: 'bg-text-placeholder/20', text: 'text-text-placeholder', label: status };
    return (
      <span className={`rounded-full ${badge.bg} px-2 py-1 text-xs font-medium ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const hasRecommendations = recentActivities.recommendations.length > 0;
  const hasBugReports = recentActivities.bugReports.length > 0;

  if (!hasRecommendations && !hasBugReports) {
    return (
      <div className="rounded-lg border border-[var(--border-default)] bg-bg-surface p-6">
        <h2 className="mb-6 text-xl font-bold text-text-primary">최근 활동</h2>
        <div className="text-center text-text-tertiary py-8">최근 활동이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-bg-surface p-6">
      <h2 className="mb-6 text-xl font-bold text-text-primary">최근 활동</h2>

      <div className="space-y-6">
        {/* 최근 메뉴 추천 */}
        {hasRecommendations && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-text-primary">
              <Clock className="h-5 w-5 text-brand-primary" />
              최근 메뉴 추천
            </h3>
            <div className="space-y-3">
              {recentActivities.recommendations.map((recommendation) => (
                <div
                  key={recommendation.id}
                  className="rounded-lg border border-[var(--border-default)] bg-bg-surface p-4"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-text-tertiary mt-0.5" />
                    <div className="flex-1">
                      <div className="mb-2 text-sm text-text-secondary">
                        {recommendation.requestAddress}
                      </div>
                      <div className="mb-2 flex flex-wrap gap-2">
                        {recommendation.recommendations.map((menu, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-brand-tertiary px-3 py-1 text-sm text-brand-primary"
                          >
                            {menu}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-text-placeholder">
                        {formatDate(recommendation.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 최근 버그 리포트 */}
        {hasBugReports && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-text-primary">
              <AlertCircle className="h-5 w-5 text-brand-primary" />
              최근 버그 리포트
            </h3>
            <div className="space-y-3">
              {recentActivities.bugReports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-lg border border-[var(--border-default)] bg-bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-xs text-text-tertiary">{report.category}</span>
                        {getStatusBadge(report.status)}
                      </div>
                      <div className="mb-2 font-medium text-text-primary">{report.title}</div>
                      <div className="text-xs text-text-placeholder">{formatDate(report.createdAt)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
