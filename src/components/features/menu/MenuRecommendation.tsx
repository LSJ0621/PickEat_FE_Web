/**
 * 메뉴 추천 컴포넌트
 */

import { useState } from 'react';
import { menuService } from '@/api/services/menu';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/common/Button';
import { useNavigate } from 'react-router-dom';

interface MenuRecommendationProps {
  onMenuSelect?: (
    menuName: string,
    historyId: number,
    meta: {
      requestAddress: string | null;
      requestLocation: { lat: number; lng: number } | null;
    }
  ) => void;
}

export const MenuRecommendation = ({ onMenuSelect }: MenuRecommendationProps) => {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [menuHistoryId, setMenuHistoryId] = useState<number | null>(null);
  const [requestAddress, setRequestAddress] = useState<string | null>(null);
  const [requestLocation, setRequestLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();
  
  // Redux에서 인증 상태 확인
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);

  const handleRecommend = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (!prompt.trim()) {
      alert('메뉴 추천 요청을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const result = await menuService.recommend(prompt);
      setRecommendations(result.recommendations);
      setMenuHistoryId(result.id); // 메뉴 추천 이력 ID 저장
      setRequestAddress(result.requestAddress ?? null);
      setRequestLocation(result.requestLocation ?? null);
    } catch (error) {
      console.error('메뉴 추천 실패:', error);
      alert('메뉴 추천에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.6)] backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-orange-200/80">Recommendation</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">메뉴 추천 받기</h2>
        </div>
        <span className="hidden rounded-full border border-white/15 px-3 py-1 text-xs text-slate-300 sm:inline-flex">
          AI curated
        </span>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="prompt" className="mb-2 block text-sm font-medium text-slate-200">
            어떤 메뉴를 원하시나요?
          </label>
          <input
            id="prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleRecommend();
              }
            }}
            placeholder="예: 오늘 기분이 안좋은데 메뉴 추천해줘"
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
            disabled={loading}
          />
        </div>
        
        <Button 
          onClick={handleRecommend} 
          isLoading={loading}
          variant="primary"
          size="lg"
          className="w-full"
        >
          메뉴 추천 받기
        </Button>
      </div>

      {recommendations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white">추천 메뉴</h3>
          <div className="mt-4 grid gap-3">
            {recommendations.map((menu, index) => (
              <button
                key={index}
                onClick={() =>
                  menuHistoryId &&
                  onMenuSelect?.(menu, menuHistoryId, {
                    requestAddress,
                    requestLocation,
                  })
                }
                className="group cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-r from-white/10 to-white/[0.02] p-4 text-left shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-white/40"
              >
                <p className="text-base font-semibold text-white">{menu}</p>
                <p className="mt-1 text-sm text-slate-300">클릭하여 주변 식당 찾기</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
