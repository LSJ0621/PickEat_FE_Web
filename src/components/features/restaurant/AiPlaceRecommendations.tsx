import { Button } from '@/components/common/Button';
import type { PlaceRecommendationItem } from '@/types/menu';

interface AiPlaceRecommendationsProps {
  menuName: string;
  recommendations: PlaceRecommendationItem[];
  loading: boolean;
  onSelect: (recommendation: PlaceRecommendationItem) => void;
  onReset: () => void;
}

export const AiPlaceRecommendations = ({
  menuName,
  recommendations,
  loading,
  onSelect,
  onReset,
}: AiPlaceRecommendationsProps) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.6)] backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-orange-200/80">AI Places</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">AI 추천 식당</h2>
          <p className="mt-2 text-sm text-slate-400">{menuName}와 어울리는 식당을 추천해드려요.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset}>
          결과 닫기
        </Button>
      </div>

      {loading ? (
        <div className="mt-10 flex items-center justify-center py-10">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-orange-500" />
        </div>
      ) : recommendations.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-slate-300">
          아직 추천 결과가 없습니다. AI 추천을 실행해보세요.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.placeId}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 shadow-xl shadow-black/30 transition hover:-translate-y-0.5 hover:border-white/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-orange-200/70">추천 식당</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">{recommendation.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-200 whitespace-pre-line">
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
      )}
    </div>
  );
};

