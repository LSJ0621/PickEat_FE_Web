/**
 * 관리자 통계 API 서비스
 */

import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  MenuTrendsQuery,
  MenuTrendsResponse,
  MenuHourlyQuery,
  HourlyAnalyticsResponse,
  MenuSlotsQuery,
  SlotAnalyticsResponse,
  MenuPopularQuery,
  PopularMenuResponse,
  MenuKeywordsQuery,
  KeywordAnalyticsResponse,
  MenuRegionsQuery,
  RegionAnalyticsResponse,
  RegionPopularMenuResponse,
  RestaurantSearchVolumeQuery,
  SearchVolumeResponse,
  RestaurantKeywordsQuery,
  SearchKeywordsResponse,
  RestaurantRegionsQuery,
  SearchRegionsResponse,
} from '@/types/admin-analytics';

export const adminAnalyticsService = {
  // Menu Analytics
  getMenuTrends: async (query?: MenuTrendsQuery): Promise<MenuTrendsResponse> => {
    const response = await apiClient.get<MenuTrendsResponse>(
      ENDPOINTS.ADMIN.ANALYTICS.MENU.TRENDS,
      { params: query }
    );
    return response.data;
  },

  getMenuHourly: async (query?: MenuHourlyQuery): Promise<HourlyAnalyticsResponse> => {
    const response = await apiClient.get<HourlyAnalyticsResponse>(
      ENDPOINTS.ADMIN.ANALYTICS.MENU.HOURLY,
      { params: query }
    );
    return response.data;
  },

  getMenuSlots: async (query?: MenuSlotsQuery): Promise<SlotAnalyticsResponse> => {
    const response = await apiClient.get<SlotAnalyticsResponse>(
      ENDPOINTS.ADMIN.ANALYTICS.MENU.SLOTS,
      { params: query }
    );
    return response.data;
  },

  getMenuPopular: async (query: MenuPopularQuery): Promise<PopularMenuResponse> => {
    const response = await apiClient.get<PopularMenuResponse>(
      ENDPOINTS.ADMIN.ANALYTICS.MENU.POPULAR,
      { params: query }
    );
    return response.data;
  },

  getMenuKeywords: async (query?: MenuKeywordsQuery): Promise<KeywordAnalyticsResponse> => {
    const response = await apiClient.get<KeywordAnalyticsResponse>(
      ENDPOINTS.ADMIN.ANALYTICS.MENU.KEYWORDS,
      { params: query }
    );
    return response.data;
  },

  getMenuRegions: async (query?: MenuRegionsQuery): Promise<RegionAnalyticsResponse> => {
    const response = await apiClient.get<RegionAnalyticsResponse>(
      ENDPOINTS.ADMIN.ANALYTICS.MENU.REGIONS,
      { params: query }
    );
    return response.data;
  },

  getMenuRegionPopular: async (region: string): Promise<RegionPopularMenuResponse> => {
    const response = await apiClient.get<RegionPopularMenuResponse>(
      ENDPOINTS.ADMIN.ANALYTICS.MENU.REGION_POPULAR(region)
    );
    return response.data;
  },

  // Restaurant Search Analytics
  getRestaurantSearchVolume: async (
    query?: RestaurantSearchVolumeQuery
  ): Promise<SearchVolumeResponse> => {
    const response = await apiClient.get<SearchVolumeResponse>(
      ENDPOINTS.ADMIN.ANALYTICS.RESTAURANT.SEARCH_VOLUME,
      { params: query }
    );
    return response.data;
  },

  getRestaurantKeywords: async (
    query?: RestaurantKeywordsQuery
  ): Promise<SearchKeywordsResponse> => {
    const response = await apiClient.get<SearchKeywordsResponse>(
      ENDPOINTS.ADMIN.ANALYTICS.RESTAURANT.KEYWORDS,
      { params: query }
    );
    return response.data;
  },

  getRestaurantRegions: async (
    query?: RestaurantRegionsQuery
  ): Promise<SearchRegionsResponse> => {
    const response = await apiClient.get<SearchRegionsResponse>(
      ENDPOINTS.ADMIN.ANALYTICS.RESTAURANT.REGIONS,
      { params: query }
    );
    return response.data;
  },
};
