/**
 * 검색 관련 타입 정의
 */

export interface Restaurant {
  name: string;
  address: string;
  roadAddress?: string;
  phone?: string;
  mapx?: number;
  mapy?: number;
  latitude?: number;
  longitude?: number;
  distance?: number;
  link?: string;
}

export interface SearchRestaurantsRequest {
  menuName: string;
  latitude: number;
  longitude: number;
  includeRoadAddress?: boolean;
}

export interface SearchRestaurantsResponse {
  restaurants: Restaurant[];
}

