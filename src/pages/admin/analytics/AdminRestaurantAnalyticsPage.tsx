/**
 * 음식점 검색 통계 페이지
 * 음식점 검색 데이터를 시각화하여 표시
 */

import { useState, useEffect, useCallback } from 'react';
import {
  SearchVolumeChart,
  SearchKeywordsTable,
  SearchRegionChart,
  RestaurantAnalyticsSkeleton,
} from '@/components/features/admin/analytics/restaurant';
import { adminAnalyticsService } from '@/api/services/admin-analytics';
import type {
  SearchVolumeResponse,
  SearchKeywordsResponse,
  SearchRegionsResponse,
  TrendPeriod,
} from '@/types/admin-analytics';
import { handleApiError } from '@/utils/error';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export function AdminRestaurantAnalyticsPage() {
  const [period, setPeriod] = useState<TrendPeriod>('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [searchVolumeData, setSearchVolumeData] = useState<SearchVolumeResponse | null>(null);
  const [keywordsData, setKeywordsData] = useState<SearchKeywordsResponse | null>(null);
  const [regionsData, setRegionsData] = useState<SearchRegionsResponse | null>(null);
  const { handleError } = useErrorHandler();

  const fetchData = useCallback(async (selectedPeriod: TrendPeriod) => {
    try {
      setIsLoading(true);
      const [volumeResponse, keywordsResponse, regionsResponse] = await Promise.all([
        adminAnalyticsService.getRestaurantSearchVolume({ period: selectedPeriod }),
        adminAnalyticsService.getRestaurantKeywords({ period: selectedPeriod, limit: 10 }),
        adminAnalyticsService.getRestaurantRegions({ period: selectedPeriod }),
      ]);

      setSearchVolumeData(volumeResponse);
      setKeywordsData(keywordsResponse);
      setRegionsData(regionsResponse);
    } catch (error) {
      handleApiError(error, 'AdminRestaurantAnalyticsPage', handleError);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    fetchData(period);
  }, [period, fetchData]);

  const handlePeriodChange = (newPeriod: TrendPeriod) => {
    setPeriod(newPeriod);
    fetchData(newPeriod);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">음식점 검색 통계</h1>
          <p className="text-slate-400 mt-1">음식점 검색 데이터를 분석하고 시각화합니다.</p>
        </div>
        <RestaurantAnalyticsSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">음식점 검색 통계</h1>
        <p className="text-slate-400 mt-1">음식점 검색 데이터를 분석하고 시각화합니다.</p>
      </div>

      <div className="space-y-6">
        {searchVolumeData && (
          <SearchVolumeChart
            data={searchVolumeData}
            period={period}
            onPeriodChange={handlePeriodChange}
          />
        )}

        {keywordsData && <SearchKeywordsTable data={keywordsData} />}

        {regionsData && <SearchRegionChart data={regionsData} />}
      </div>
    </div>
  );
}
