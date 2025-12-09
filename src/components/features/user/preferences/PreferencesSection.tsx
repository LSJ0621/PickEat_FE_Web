import { Button } from '@/components/common/Button';

interface PreferencesSectionProps {
  likes: string[];
  dislikes: string[];
  analysis: string | null;
  isLoading: boolean;
  onEditClick: () => void;
}

export const PreferencesSection = ({
  likes,
  dislikes,
  analysis,
  isLoading,
  onEditClick,
}: PreferencesSectionProps) => {
  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-400">취향</p>
          {isLoading ? (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-orange-500"></div>
              <span className="text-slate-400">로딩 중...</span>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {likes.length > 0 && (
                <div>
                  <p className="mb-2 text-xs text-slate-400">좋아하는 것</p>
                  <div className="flex flex-wrap gap-2">
                    {likes.map((like, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm text-green-200"
                      >
                        {like}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {dislikes.length > 0 && (
                <div>
                  <p className="mb-2 text-xs text-slate-400">싫어하는 것</p>
                  <div className="flex flex-wrap gap-2">
                    {dislikes.map((dislike, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm text-red-200"
                      >
                        {dislike}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {analysis && (
                <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4">
                  <p className="mb-2 text-xs font-medium text-purple-200">AI 리포트</p>
                  <p className="text-sm leading-relaxed text-slate-100">{analysis}</p>
                </div>
              )}
              {likes.length === 0 && dislikes.length === 0 && !analysis && (
                <p className="text-sm text-slate-400">등록된 취향 정보가 없습니다.</p>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            className="bg-gradient-to-r from-orange-500 to-rose-500 px-5 text-white shadow-md shadow-orange-500/30"
            onClick={onEditClick}
          >
            취향 수정
          </Button>
        </div>
      </div>
    </div>
  );
};

