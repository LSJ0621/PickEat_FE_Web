/**
 * 초기 설정 취향 섹션 컴포넌트
 * 좋아하는 것/싫어하는 것 입력 UI를 제공합니다.
 */

import { Button } from '@/components/common/Button';
import { useState } from 'react';

interface InitialSetupPreferencesSectionProps {
  likes: string[];
  dislikes: string[];
  onLikesChange: (likes: string[]) => void;
  onDislikesChange: (dislikes: string[]) => void;
}

export const InitialSetupPreferencesSection = ({
  likes,
  dislikes,
  onLikesChange,
  onDislikesChange,
}: InitialSetupPreferencesSectionProps) => {
  const [newLike, setNewLike] = useState('');
  const [newDislike, setNewDislike] = useState('');

  // 취향 추가/삭제
  const handleAddLike = () => {
    if (newLike.trim() && !likes.includes(newLike.trim())) {
      onLikesChange([...likes, newLike.trim()]);
      setNewLike('');
    }
  };

  const handleRemoveLike = (item: string) => {
    onLikesChange(likes.filter((like) => like !== item));
  };

  const handleAddDislike = () => {
    if (newDislike.trim() && !dislikes.includes(newDislike.trim())) {
      onDislikesChange([...dislikes, newDislike.trim()]);
      setNewDislike('');
    }
  };

  const handleRemoveDislike = (item: string) => {
    onDislikesChange(dislikes.filter((dislike) => dislike !== item));
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">취향 정보</h3>
        <p className="mt-1 text-sm text-slate-400">좋아하는 음식과 싫어하는 음식을 입력해주세요</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">좋아하는 것</label>
          <div className="mb-2 flex gap-2">
            <input
              type="text"
              value={newLike}
              onChange={(e) => setNewLike(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddLike();
                }
              }}
              placeholder="좋아하는 음식이나 재료를 입력하세요"
              className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
            />
            <Button onClick={handleAddLike} size="md">
              추가
            </Button>
          </div>
          {likes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {likes.map((like, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm text-green-200"
                >
                  {like}
                  <button
                    onClick={() => handleRemoveLike(like)}
                    className="text-green-300 hover:text-green-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">싫어하는 것</label>
          <div className="mb-2 flex gap-2">
            <input
              type="text"
              value={newDislike}
              onChange={(e) => setNewDislike(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddDislike();
                }
              }}
              placeholder="싫어하는 음식이나 재료를 입력하세요"
              className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
            />
            <Button onClick={handleAddDislike} size="md">
              추가
            </Button>
          </div>
          {dislikes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dislikes.map((dislike, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm text-red-200"
                >
                  {dislike}
                  <button
                    onClick={() => handleRemoveDislike(dislike)}
                    className="text-red-300 hover:text-red-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

