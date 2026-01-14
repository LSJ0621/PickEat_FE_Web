/**
 * 관리자 분석(Analytics) 관련 타입 정의
 */

// Query 파라미터 타입들
export type TrendPeriod = '7d' | '30d' | '90d' | '1y';
export type GroupBy = 'day' | 'week' | 'month';
export type PopularMenuType = 'recommended' | 'selected';
export type SearchType = 'places' | 'blogs' | 'all';
export type TrendDirection = 'up' | 'down' | 'stable';

// 메뉴 분석 타입
export interface MenuTrendsResponse {
  data: Array<{ date: string; count: number }>;
  summary: {
    total: number;
    average: number;
    change: number;
  };
}

export interface HourlyAnalyticsResponse {
  byHour: Array<{ hour: number; count: number }>;
  byDayAndHour: Array<{ day: number; hour: number; count: number }>;
  peakTime: {
    hour: number;
    count: number;
  };
}

export interface SlotAnalyticsResponse {
  data: {
    breakfast: number;
    lunch: number;
    dinner: number;
    etc: number;
  };
  trends: Array<{
    date: string;
    breakfast: number;
    lunch: number;
    dinner: number;
    etc: number;
  }>;
}

export interface PopularMenuResponse {
  data: Array<{
    menu: string;
    count: number;
    rate?: number;
  }>;
}

export interface KeywordAnalyticsResponse {
  data: Array<{
    keyword: string;
    count: number;
    trend: TrendDirection;
    changeRate: number;
  }>;
}

export interface RegionAnalyticsResponse {
  byRegion: Array<{
    region: string;
    count: number;
    percentage: number;
  }>;
}

export interface RegionPopularMenuResponse {
  region: string;
  data: Array<{
    menu: string;
    count: number;
    nationalRank: number;
    isUnique: boolean;
  }>;
}

// 음식점 분석 타입
export interface SearchVolumeResponse {
  places: Array<{ date: string; count: number }>;
  blogs: Array<{ date: string; count: number }>;
  summary: {
    totalPlaceSearches: number;
    totalBlogSearches: number;
    placeChangeRate: number;
    blogChangeRate: number;
  };
}

export interface SearchKeywordsResponse {
  data: Array<{
    keyword: string;
    count: number;
    trend: TrendDirection;
    changeRate: number;
  }>;
}

export interface SearchRegionsResponse {
  data: Array<{
    region: string;
    count: number;
    percentage: number;
    coordinates: {
      lat: number;
      lng: number;
    };
  }>;
}

// Query 파라미터 인터페이스들
export interface MenuTrendsQuery {
  period?: TrendPeriod;
  startDate?: string;
  endDate?: string;
  groupBy?: GroupBy;
}

export interface MenuHourlyQuery {
  period?: TrendPeriod;
}

export interface MenuSlotsQuery {
  period?: TrendPeriod;
}

export interface MenuPopularQuery {
  type: PopularMenuType;
  period?: TrendPeriod;
  slot?: string;
  limit?: number;
}

export interface MenuKeywordsQuery {
  period?: TrendPeriod;
  limit?: number;
}

export interface MenuRegionsQuery {
  period?: TrendPeriod;
}

export interface RestaurantSearchVolumeQuery {
  period?: TrendPeriod;
  type?: SearchType;
}

export interface RestaurantKeywordsQuery {
  period?: TrendPeriod;
  limit?: number;
}

export interface RestaurantRegionsQuery {
  period?: TrendPeriod;
}
