import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000';

export interface Restaurant {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number | null;
  userRatingCount: number | null;
  priceLevel: string | null;
  photos: string[] | null;
  openNow: boolean | null;
}

export interface RestaurantSearchResponse {
  restaurants: Restaurant[];
}

export const mockRestaurants: Restaurant[] = [
  {
    placeId: 'ChIJ1234567890',
    name: '명동 김치찌개',
    address: '서울시 중구 명동길 123',
    latitude: 37.5636,
    longitude: 126.9869,
    rating: 4.5,
    userRatingCount: 1234,
    priceLevel: 'MODERATE',
    photos: ['https://example.com/photo1.jpg'],
    openNow: true,
  },
  {
    placeId: 'ChIJ0987654321',
    name: '강남 불고기',
    address: '서울시 강남구 강남대로 456',
    latitude: 37.4979,
    longitude: 127.0276,
    rating: 4.3,
    userRatingCount: 567,
    priceLevel: 'EXPENSIVE',
    photos: ['https://example.com/photo2.jpg'],
    openNow: false,
  },
  {
    placeId: 'ChIJ1122334455',
    name: '홍대 비빔밥',
    address: '서울시 마포구 홍익로 789',
    latitude: 37.5563,
    longitude: 126.9237,
    rating: 4.1,
    userRatingCount: 890,
    priceLevel: 'INEXPENSIVE',
    photos: ['https://example.com/photo3.jpg'],
    openNow: true,
  },
];

// Search endpoint has been removed (일반 검색 기능 제거됨)
export const searchHandlers = [
  http.post(`${BASE_URL}/search/restaurants`, async ({ request }) => {
    const body = (await request.json()) as {
      menuName: string;
      latitude: number;
      longitude: number;
      includeRoadAddress?: boolean;
    };

    if (!body.menuName) {
      return HttpResponse.json(
        { message: '메뉴 이름을 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!body.latitude || !body.longitude) {
      return HttpResponse.json(
        { message: '위치 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    let filteredRestaurants = mockRestaurants;

    if (body.menuName.includes('김치찌개')) {
      filteredRestaurants = mockRestaurants.filter((r) =>
        r.name.includes('김치찌개')
      );
    } else if (body.menuName.includes('불고기')) {
      filteredRestaurants = mockRestaurants.filter((r) =>
        r.name.includes('불고기')
      );
    }

    if (filteredRestaurants.length === 0) {
      filteredRestaurants = mockRestaurants;
    }

    const response: RestaurantSearchResponse = {
      restaurants: filteredRestaurants,
    };
    return HttpResponse.json(response);
  }),
];
