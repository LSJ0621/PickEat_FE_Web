import { Button } from '@/components/common/Button';
import type { PlaceRecommendationItem } from '@/types/menu';

interface MenuPlaceRecommendationGroup {
  menuName: string;
  recommendations: PlaceRecommendationItem[];
}

interface AiPlaceRecommendationsProps {
  activeMenuName: string | null;
  recommendations: MenuPlaceRecommendationGroup[];
  isLoading: boolean;
  loadingMenuName: string | null;
  onSelect: (recommendation: PlaceRecommendationItem) => void;
  onReset: () => void;
}

export const AiPlaceRecommendations = ({
  activeMenuName,
  recommendations,
  isLoading,
  loadingMenuName,
  onSelect,
  onReset,
}: AiPlaceRecommendationsProps) => {
  const visibleGroups = recommendations.filter((group) => group.recommendations.length > 0);
  const hasRecommendations = visibleGroups.length > 0;
  const pendingMenuName = isLoading ? loadingMenuName : null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.6)] backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-orange-200/80">AI Places</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">메뉴별 AI 추천 식당</h2>
          {activeMenuName && (
            <p className="mt-2 text-sm text-slate-400">현재 선택된 메뉴: {activeMenuName}</p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onReset}>
          결과 초기화
        </Button>
      </div>

      {!hasRecommendations && !pendingMenuName ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-slate-300">
          아직 추천 결과가 없습니다. AI 추천을 실행해보세요.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {visibleGroups.map((group) => (
            <div
              key={group.menuName}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 shadow-xl shadow-black/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-orange-200/70">메뉴</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">{group.menuName}</h3>
                  <p className="mt-2 text-sm text-slate-300">이 메뉴에 어울리는 가게를 추천했어요.</p>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {group.recommendations.map((recommendation) => (
                  <div
                    key={`${group.menuName}-${recommendation.placeId}`}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-white/30"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.25em] text-orange-200/70">추천 식당</p>
                        <h4 className="mt-1 text-lg font-semibold text-white">{recommendation.name}</h4>
                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-200">
                          {recommendation.reason}
                        </p>
                      </div>
                      <Button size="sm" variant="primary" onClick={() => onSelect(recommendation)}>
                        상세 보기
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {pendingMenuName && (
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 shadow-xl shadow-black/30">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-orange-200/70">메뉴</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">{pendingMenuName}</h3>
                  <p className="mt-2 text-sm text-slate-300">AI가 가게를 찾는 중입니다.</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 text-slate-200">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-orange-500" />
                <span className="text-sm">추천 결과를 준비하고 있어요...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
