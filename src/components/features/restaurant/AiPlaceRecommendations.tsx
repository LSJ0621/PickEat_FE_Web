import { Button } from '@/components/common/Button';
import type { PlaceRecommendationItem } from '@/types/menu';
import { useEffect, useState } from 'react';

interface MenuPlaceRecommendationGroup {
  menuName: string;
  recommendations: PlaceRecommendationItem[];
}

interface AiPlaceRecommendationsProps {
  activeMenuName: string | null;
  recommendations: MenuPlaceRecommendationGroup[];
  loadingMenuName: string | null;
  onSelect: (recommendation: PlaceRecommendationItem) => void;
  onReset: () => void;
}

export const AiPlaceRecommendations = ({
  activeMenuName,
  recommendations,
  loadingMenuName,
  onSelect,
  onReset,
}: AiPlaceRecommendationsProps) => {
  const visibleGroups = recommendations.filter((group) => group.recommendations.length > 0);
  const hasRecommendations = visibleGroups.length > 0;
  // loadingMenuName이 있으면 로딩 UI 표시 (isLoading 상태와 무관)
  const pendingMenuName = loadingMenuName;
  
  // 아코디언 상태 관리: 각 메뉴별로 펼침/접힘 상태
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  
  // activeMenuName이 변경되면 해당 메뉴를 자동으로 펼침
  useEffect(() => {
    if (activeMenuName) {
      setExpandedMenus((prev) => new Set([...prev, activeMenuName]));
    }
  }, [activeMenuName]);
  
  // 메뉴 클릭 시 펼침/접힘 토글
  const toggleMenu = (menuName: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuName)) {
        newSet.delete(menuName);
      } else {
        newSet.add(menuName);
      }
      return newSet;
    });
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.6)] backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-orange-200/80">AI Places</p>
          <h2 className="mt-1.5 text-xl font-semibold text-white">AI 추천 식당</h2>
        </div>
        {hasRecommendations && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-slate-400 hover:text-white">
            초기화
          </Button>
        )}
      </div>

      {!hasRecommendations && !pendingMenuName ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-slate-300">
          아직 추천 결과가 없습니다. AI 추천을 실행해보세요.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <p className="text-xs text-slate-400">
            가게 카드를 누르면 상세 정보를 확인할 수 있습니다.
          </p>
          {visibleGroups.map((group) => {
            const isExpanded = expandedMenus.has(group.menuName);
            const isActive = activeMenuName === group.menuName;
            
            return (
              <div
                key={group.menuName}
                className={`rounded-xl border transition-all duration-300 ${
                  isActive 
                    ? 'border-orange-400/30 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent' 
                    : 'border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent'
                }`}
              >
                {/* 아코디언 헤더 */}
                <button
                  onClick={() => toggleMenu(group.menuName)}
                  className="w-full px-4 py-3 text-left transition-all duration-300 hover:bg-white/5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-base font-semibold truncate ${
                          isActive ? 'text-orange-200' : 'text-white'
                        }`}>
                          {group.menuName}
                        </h3>
                        <span className="flex-shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">
                          {group.recommendations.length}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <svg
                        className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${
                          isExpanded ? 'rotate-0' : '-rotate-90'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* 아코디언 컨텐츠 */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-4 animate-fade-in">
                    {group.recommendations.map((recommendation) => {
                      const itemKey = `${group.menuName}-${recommendation.placeId}`;
                      return (
                        <div
                          key={itemKey}
                          role="button"
                          tabIndex={0}
                          onClick={() => onSelect(recommendation)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onSelect(recommendation);
                            }
                          }}
                          className="rounded-lg border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400/40"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-semibold text-white">{recommendation.name}</h4>
                              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-300">
                                {recommendation.reason}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {pendingMenuName && (
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white truncate">{pendingMenuName}</h3>
                  <p className="mt-1 text-sm text-slate-400">AI가 가게를 찾는 중입니다...</p>
                </div>
                <div className="h-8 w-8 flex-shrink-0 animate-spin rounded-full border-b-2 border-orange-500" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
