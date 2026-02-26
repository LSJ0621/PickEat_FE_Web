/**
 * 결과 탭 네비게이션 컴포넌트
 * 일반 검색과 AI 추천을 탭으로 전환합니다.
 */

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/utils/cn';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => onTabChange(v as TabType)}
      className="space-y-3 sm:space-y-4"
    >
      {/* Tab navigation */}
      <TabsList className="h-auto w-full gap-1 rounded-xl border border-border-default bg-bg-secondary p-1 sm:gap-1.5 sm:rounded-2xl">
        <TabsTrigger
          data-testid="results-tab-general-search"
          value="search"
          className={cn(
            'flex-1 gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm',
            'data-[state=inactive]:text-text-tertiary data-[state=inactive]:hover:bg-bg-hover data-[state=inactive]:hover:text-text-primary',
            'data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-primary/20 data-[state=active]:to-rose-500/20',
            'data-[state=active]:text-text-primary data-[state=active]:shadow-md data-[state=active]:shadow-brand-primary/10'
          )}
        >
          <Search className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          <span className="truncate">{t('agent.tabs.generalSearch')}</span>
          {searchLoading ? (
            <Loader2 className="h-3 w-3 shrink-0 animate-spin sm:h-3.5 sm:w-3.5" />
          ) : (
            searchCount > 0 && (
              <span className="shrink-0 rounded-full bg-bg-tertiary px-1.5 py-0.5 text-[10px] leading-none sm:text-xs">
                {searchCount}
              </span>
            )
          )}
        </TabsTrigger>

        <TabsTrigger
          data-testid="results-tab-ai-recommendation"
          value="ai"
          className={cn(
            'flex-1 gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm',
            'data-[state=inactive]:text-text-tertiary data-[state=inactive]:hover:bg-bg-hover data-[state=inactive]:hover:text-text-primary',
            'data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-primary/20 data-[state=active]:to-rose-500/20',
            'data-[state=active]:text-text-primary data-[state=active]:shadow-md data-[state=active]:shadow-brand-primary/10'
          )}
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          <span className="truncate">{t('agent.tabs.aiRecommendation')}</span>
          {aiLoading ? (
            <Loader2 className="h-3 w-3 shrink-0 animate-spin sm:h-3.5 sm:w-3.5" />
          ) : (
            aiCount > 0 && (
              <span className="shrink-0 rounded-full bg-bg-tertiary px-1.5 py-0.5 text-[10px] leading-none sm:text-xs">
                {aiCount}
              </span>
            )
          )}
        </TabsTrigger>
      </TabsList>

      {/* Tab content */}
      <TabsContent value="search" className="mt-0 min-h-[200px] animate-fade-in">
        {searchContent}
      </TabsContent>
      <TabsContent value="ai" className="mt-0 min-h-[200px] animate-fade-in">
        {aiContent}
      </TabsContent>
    </Tabs>
  );
};
