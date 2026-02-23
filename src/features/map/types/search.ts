/**
 * 식당/장소 검색 관련 타입 정의
 * 지도, 이력 등 여러 기능에서 공통으로 사용하는 Restaurant 타입
 */

export interface Restaurant {
  name: string;
  link?: string;
  category?: string;
  description?: string;
  telephone?: string;
  phone?: string;
  address?: string;
  roadAddress?: string;
  mapx?: number;
  mapy?: number;
  latitude?: number;
  longitude?: number;
}
