/**
 * 사용자 선호도 정보 카드 컴포넌트
 */

import type { AdminUserDetail } from '@/types/admin';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface UserPreferencesCardProps {
  preferences: AdminUserDetail['preferences'];
}

export const UserPreferencesCard = ({ preferences }: UserPreferencesCardProps) => {
  if (!preferences || (!preferences.likes.length && !preferences.dislikes.length)) {
    return (
      <div className="rounded-lg border border-border-default bg-bg-surface p-6">
        <h2 className="mb-6 text-xl font-bold text-text-primary">선호도</h2>
        <div className="text-center text-text-tertiary py-8">등록된 선호도 정보가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border-default bg-bg-surface p-6">
      <h2 className="mb-6 text-xl font-bold text-text-primary">선호도</h2>

      <div className="space-y-6">
        {/* 좋아하는 음식 */}
        {preferences.likes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ThumbsUp className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-text-primary">좋아하는 음식</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.likes.map((item, index) => (
                <span
                  key={index}
                  className="rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-600"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 싫어하는 음식 */}
        {preferences.dislikes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ThumbsDown className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold text-text-primary">싫어하는 음식</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.dislikes.map((item, index) => (
                <span
                  key={index}
                  className="rounded-full bg-red-500/20 px-3 py-1 text-sm text-red-600"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
