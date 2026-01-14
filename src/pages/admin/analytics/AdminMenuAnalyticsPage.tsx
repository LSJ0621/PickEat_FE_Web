/**
 * 메뉴 추천 통계 페이지
 * 메뉴 추천 데이터를 시각화하여 표시
 */

import { useEffect, useState } from 'react';
import { adminAnalyticsService } from '@/api/services/admin-analytics';
import { HourlyHeatmap } from '@/components/features/admin/analytics/menu/HourlyHeatmap';
import { KeywordCloud } from '@/components/features/admin/analytics/menu/KeywordCloud';
import { MenuAnalyticsSkeleton } from '@/components/features/admin/analytics/menu/MenuAnalyticsSkeleton';
import { MenuTrendChart } from '@/components/features/admin/analytics/menu/MenuTrendChart';
import { PopularMenuTable } from '@/components/features/admin/analytics/menu/PopularMenuTable';
import { RegionAnalytics } from '@/components/features/admin/analytics/menu/RegionAnalytics';
import { SlotPieChart } from '@/components/features/admin/analytics/menu/SlotPieChart';
import type {
  HourlyAnalyticsResponse,
  KeywordAnalyticsResponse,
  MenuTrendsResponse,
  PopularMenuResponse,
  PopularMenuType,
  RegionAnalyticsResponse,
  SlotAnalyticsResponse,
  TrendPeriod,
} from '@/types/admin-analytics';
import { extractErrorMessage, handleApiError } from '@/utils/error';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { AlertCircle } from 'lucide-react';

export function AdminMenuAnalyticsPage() {
  // State for period filter
  const [period, setPeriod] = useState<TrendPeriod>('30d');

  // State for popular menu filters
  const [menuType, setMenuType] = useState<PopularMenuType>('recommended');
  const [slot, setSlot] = useState<string>('all');

  // Data states
  const [trendData, setTrendData] = useState<MenuTrendsResponse | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyAnalyticsResponse | null>(null);
  const [slotData, setSlotData] = useState<SlotAnalyticsResponse | null>(null);
  const [popularData, setPopularData] = useState<PopularMenuResponse | null>(null);
  const [keywordData, setKeywordData] = useState<KeywordAnalyticsResponse | null>(null);
  const [regionData, setRegionData] = useState<RegionAnalyticsResponse | null>(null);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Error handler
  const { handleError: showErrorToast } = useErrorHandler();

  // Fetch all analytics data
  useEffect(() => {
    fetchAnalyticsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  // Fetch popular menu data when filters change
  useEffect(() => {
    fetchPopularMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, menuType, slot]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [trends, hourly, slots, keywords, regions] = await Promise.all([
        adminAnalyticsService.getMenuTrends({ period }),
        adminAnalyticsService.getMenuHourly({ period }),
        adminAnalyticsService.getMenuSlots({ period }),
        adminAnalyticsService.getMenuKeywords({ period, limit: 30 }),
        adminAnalyticsService.getMenuRegions({ period }),
      ]);

      setTrendData(trends);
      setHourlyData(hourly);
      setSlotData(slots);
      setKeywordData(keywords);
      setRegionData(regions);

      // Fetch popular menus separately
      await fetchPopularMenus();
    } catch (err) {
      const errorMessage = extractErrorMessage(err, '통계 데이터를 불러오는데 실패했습니다.');
      setError(errorMessage);
      handleApiError(err, 'AdminMenuAnalyticsPage', showErrorToast);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularMenus = async () => {
    try {
      const popular = await adminAnalyticsService.getMenuPopular({
        type: menuType,
        period,
        slot: slot === 'all' ? undefined : slot,
        limit: 20,
      });
      setPopularData(popular);
    } catch (err) {
      // 인기 메뉴 fetch 실패 시 메인 데이터는 유지하고 인기 메뉴만 초기화
      setPopularData(null);
      handleApiError(err, 'AdminMenuAnalyticsPage', showErrorToast);
    }
  };

  const handlePeriodChange = (newPeriod: TrendPeriod) => {
    setPeriod(newPeriod);
  };

  const handleMenuTypeChange = (type: PopularMenuType) => {
    setMenuType(type);
  };

  const handleSlotChange = (newSlot: string) => {
    setSlot(newSlot);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">메뉴 추천 통계</h1>
            <p className="text-slate-400 mt-1">메뉴 추천 데이터를 분석하고 시각화합니다.</p>
          </div>
          <MenuAnalyticsSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !trendData || !hourlyData || !slotData || !keywordData || !regionData) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">메뉴 추천 통계</h1>
            <p className="text-slate-400 mt-1">메뉴 추천 데이터를 분석하고 시각화합니다.</p>
          </div>
          <div className="bg-red-950/20 border border-red-600 rounded-lg p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">데이터 로드 실패</h2>
            <p className="text-slate-400 mb-4">{error || '데이터를 불러올 수 없습니다.'}</p>
            <button
              onClick={fetchAnalyticsData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">메뉴 추천 통계</h1>
          <p className="text-slate-400 mt-1">메뉴 추천 데이터를 분석하고 시각화합니다.</p>
        </div>

        {/* Menu trend chart */}
        <MenuTrendChart data={trendData} period={period} onPeriodChange={handlePeriodChange} />

        {/* Hourly heatmap and Slot pie chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HourlyHeatmap data={hourlyData} />
          <SlotPieChart data={slotData} />
        </div>

        {/* Popular menu table */}
        {popularData && (
          <PopularMenuTable
            data={popularData}
            menuType={menuType}
            slot={slot}
            onMenuTypeChange={handleMenuTypeChange}
            onSlotChange={handleSlotChange}
          />
        )}

        {/* Keyword cloud and Region analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <KeywordCloud data={keywordData} />
          <RegionAnalytics data={regionData} />
        </div>
      </div>
    </div>
  );
}
