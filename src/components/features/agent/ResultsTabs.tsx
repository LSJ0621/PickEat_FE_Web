/**
 * 결과 탭 네비게이션 컴포넌트
 * 일반 검색과 AI 추천을 탭으로 전환합니다.
 */

type TabType = 'search' | 'ai';

interface ResultsTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  searchCount: number;
  aiCount: number;
  searchLoading?: boolean;
  aiLoading?: boolean;
  searchContent: React.ReactNode;
  aiContent: React.ReactNode;
}

export const ResultsTabs = ({
  activeTab,
  onTabChange,
  searchCount,
  aiCount,
  searchLoading = false,
  aiLoading = false,
  searchContent,
  aiContent,
}: ResultsTabsProps) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* 탭 네비게이션 */}
      <div className="flex gap-1.5 rounded-lg border border-white/10 bg-white/5 p-0.5 sm:gap-2 sm:rounded-xl sm:p-1">
        <button
          onClick={() => onTabChange('search')}
          className={`flex-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-300 sm:rounded-lg sm:px-4 sm:py-2 sm:text-sm ${
            activeTab === 'search'
              ? 'bg-gradient-to-r from-orange-500/20 to-rose-500/20 text-white shadow-md shadow-orange-500/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <span className="truncate">일반 검색</span>
            {searchLoading ? (
              <div className="h-2.5 w-2.5 flex-shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent sm:h-3 sm:w-3" />
            ) : (
              searchCount > 0 && (
                <span className="flex-shrink-0 rounded-full bg-white/10 px-1 py-0.5 text-[10px] sm:px-1.5 sm:text-xs">{searchCount}</span>
              )
            )}
          </div>
        </button>
        <button
          onClick={() => onTabChange('ai')}
          className={`flex-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-300 sm:rounded-lg sm:px-4 sm:py-2 sm:text-sm ${
            activeTab === 'ai'
              ? 'bg-gradient-to-r from-orange-500/20 to-rose-500/20 text-white shadow-md shadow-orange-500/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <span className="truncate">AI 추천</span>
            {aiLoading ? (
              <div className="h-2.5 w-2.5 flex-shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent sm:h-3 sm:w-3" />
            ) : (
              aiCount > 0 && (
                <span className="flex-shrink-0 rounded-full bg-white/10 px-1 py-0.5 text-[10px] sm:px-1.5 sm:text-xs">{aiCount}</span>
              )
            )}
          </div>
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="min-h-[200px]">
        <div className="relative">
          <div className={`animate-fade-in ${activeTab === 'search' ? 'block' : 'hidden'}`}>
            {searchContent}
          </div>
          <div className={`animate-fade-in ${activeTab === 'ai' ? 'block' : 'hidden'}`}>
            {aiContent}
          </div>
        </div>
      </div>
    </div>
  );
};

