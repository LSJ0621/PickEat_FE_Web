/**
 * 사용자 활동 통계 카드 컴포넌트
 */

import type { AdminUserDetail } from '@/types/admin';
import { TrendingUp, CheckSquare, AlertCircle } from 'lucide-react';

interface UserStatsCardProps {
  stats: AdminUserDetail['stats'];
}

export const UserStatsCard = ({ stats }: UserStatsCardProps) => {
  return (
    <div className="rounded-lg border border-border-default bg-bg-surface p-6">
      <h2 className="mb-6 text-xl font-bold text-text-primary">활동 통계</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* 메뉴 추천 */}
        <div className="rounded-lg border border-border-default bg-bg-primary p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-pink-500/20 p-3">
              <TrendingUp className="h-6 w-6 text-pink-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{stats.menuRecommendations}</div>
              <div className="text-sm text-text-tertiary">메뉴 추천</div>
            </div>
          </div>
        </div>

        {/* 메뉴 선택 */}
        <div className="rounded-lg border border-border-default bg-bg-primary p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-500/20 p-3">
              <CheckSquare className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{stats.menuSelections}</div>
              <div className="text-sm text-text-tertiary">메뉴 선택</div>
            </div>
          </div>
        </div>

        {/* 버그 리포트 */}
        <div className="rounded-lg border border-border-default bg-bg-primary p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-500/20 p-3">
              <AlertCircle className="h-6 w-6 text-brand-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{stats.bugReports}</div>
              <div className="text-sm text-text-tertiary">버그 리포트</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
