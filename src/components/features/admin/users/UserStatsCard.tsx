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
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
      <h2 className="mb-6 text-xl font-bold text-white">활동 통계</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* 메뉴 추천 */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-pink-500/20 p-3">
              <TrendingUp className="h-6 w-6 text-pink-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.menuRecommendations}</div>
              <div className="text-sm text-slate-400">메뉴 추천</div>
            </div>
          </div>
        </div>

        {/* 메뉴 선택 */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-500/20 p-3">
              <CheckSquare className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.menuSelections}</div>
              <div className="text-sm text-slate-400">메뉴 선택</div>
            </div>
          </div>
        </div>

        {/* 버그 리포트 */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-500/20 p-3">
              <AlertCircle className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.bugReports}</div>
              <div className="text-sm text-slate-400">버그 리포트</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
