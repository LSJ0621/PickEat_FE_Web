import type {
  MenuRecommendationResponse,
  PlaceRecommendationItem,
  PlaceRecommendationResponse,
  PlaceDetail,
  PlaceDetailResponse,
  PlaceHistoryPlace,
  PlaceHistoryResponse,
  RestaurantBlog,
  RestaurantBlogsResponse,
  MenuSelection,
  MenuPayload,
  PlaceReview,
} from '@/types/menu';
import type { Restaurant } from '@/types/search';

/**
 * Creates a mock Restaurant with optional overrides
 */
export function createMockRestaurant(
  overrides?: Partial<Restaurant>
): Restaurant {
  return {
    name: '김치찌개 전문점',
    address: '서울시 강남구 테헤란로 123',
    roadAddress: '서울시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    latitude: 37.5,
    longitude: 127.0,
    distance: 0.5,
    ...overrides,
  };
}

/**
 * Creates a mock MenuRecommendationResponse with optional overrides
 */
export function createMockMenuRecommendation(
  overrides?: Partial<MenuRecommendationResponse>
): MenuRecommendationResponse {
  return {
    id: 1,
    recommendations: [
      { condition: '매콤달콤한 맛을 원한다면', menu: '김치찌개' },
      { condition: '고소하고 담백한 맛을 원한다면', menu: '불고기' },
      { condition: '건강한 한 끼를 원한다면', menu: '비빔밥' },
    ],
    intro: '한식 중심의 건강한 메뉴를 추천드립니다. 오늘 같은 날씨에는 따뜻한 국물 요리가 좋을 것 같아요.',
    closing: '지금 가장 끌리는 조건을 떠올려 보시고 선택해 보세요.',
    recommendedAt: new Date().toISOString(),
    requestAddress: '서울시 강남구 테헤란로 123',
    ...overrides,
  };
}

/**
 * Creates a mock PlaceRecommendationItem with optional overrides
 */
export function createMockPlaceRecommendationItem(
  overrides?: Partial<PlaceRecommendationItem>
): PlaceRecommendationItem {
  return {
    placeId: 'ChIJ1234567890',
    name: '명동 김치찌개',
    reason: '전통적인 김치찌개 맛집으로 유명합니다.',
    menuName: '김치찌개',
    ...overrides,
  };
}

/**
 * Creates a mock PlaceRecommendationResponse with optional overrides
 */
export function createMockPlaceRecommendations(
  count: number = 3
): PlaceRecommendationResponse {
  const recommendations = Array.from({ length: count }, (_, index) =>
    createMockPlaceRecommendationItem({
      placeId: `ChIJ${index}234567890`,
      name: `맛집 ${index + 1}`,
      menuName: ['김치찌개', '불고기', '비빔밥'][index % 3],
    })
  );

  return { recommendations };
}

/**
 * Creates a mock PlaceReview with optional overrides
 */
export function createMockPlaceReview(overrides?: Partial<PlaceReview>): PlaceReview {
  return {
    rating: 4.5,
    text: '정말 맛있어요! 다음에 또 오고 싶습니다.',
    authorName: '홍길동',
    publishTime: '2024-01-10T12:00:00.000Z',
    ...overrides,
  };
}

/**
 * Creates a mock PlaceDetail with optional overrides
 */
export function createMockPlaceDetail(overrides?: Partial<PlaceDetail>): PlaceDetail {
  return {
    id: 'ChIJ1234567890',
    name: '명동 김치찌개',
    address: '서울시 중구 명동길 123',
    location: {
      latitude: 37.5636,
      longitude: 126.9869,
    },
    rating: 4.5,
    userRatingCount: 1234,
    priceLevel: 'MODERATE',
    photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
    openNow: true,
    reviews: [createMockPlaceReview(), createMockPlaceReview({ rating: 4, authorName: '김영희' })],
    ...overrides,
  };
}

/**
 * Creates a mock PlaceDetailResponse with optional overrides
 */
export function createMockPlaceDetailResponse(
  overrides?: Partial<PlaceDetail>
): PlaceDetailResponse {
  return {
    place: createMockPlaceDetail(overrides),
  };
}

/**
 * Creates a mock PlaceHistoryPlace with optional overrides
 */
export function createMockPlaceHistoryPlace(
  overrides?: Partial<PlaceHistoryPlace>
): PlaceHistoryPlace {
  return {
    menuName: '김치찌개',
    placeId: 'ChIJ1234567890',
    reason: '전통적인 김치찌개 맛집입니다.',
    name: '명동 김치찌개',
    address: '서울시 중구 명동길 123',
    rating: 4.5,
    userRatingCount: 1234,
    priceLevel: 'MODERATE',
    photos: ['https://example.com/photo1.jpg'],
    openNow: true,
    reviews: [createMockPlaceReview()],
    ...overrides,
  };
}

/**
 * Creates a mock PlaceHistoryResponse with optional overrides
 */
export function createMockPlaceHistory(
  placesCount: number = 3
): PlaceHistoryResponse {
  const places = Array.from({ length: placesCount }, (_, index) =>
    createMockPlaceHistoryPlace({
      placeId: `ChIJ${index}234567890`,
      name: `맛집 ${index + 1}`,
      menuName: ['김치찌개', '불고기', '비빔밥'][index % 3],
    })
  );

  return {
    history: {
      id: 1,
      type: 'MENU',
      prompt: '점심 메뉴 추천해줘',
      intro: '한식 중심의 건강한 메뉴를 추천드립니다.',
      recommendations: [
        { condition: '매콤한 맛을 원한다면', menu: '김치찌개' },
        { condition: '고소하고 담백한 맛을 원한다면', menu: '불고기' },
        { condition: '가볍게 한 끼를 먹고 싶다면', menu: '비빔밥' },
      ],
      closing: '맛있는 식사 되세요!',
      recommendedAt: '2024-01-15T12:00:00.000Z',
      requestAddress: '서울시 강남구 테헤란로 123',
      hasPlaceRecommendations: true,
    },
    places,
  };
}

/**
 * Creates a mock RestaurantBlog with optional overrides
 */
export function createMockRestaurantBlog(
  overrides?: Partial<RestaurantBlog>
): RestaurantBlog {
  return {
    title: '맛집 리뷰 - 정말 맛있는 곳!',
    url: 'https://blog.example.com/review',
    snippet: '이곳은 정말 맛있는 음식을 제공하는 곳입니다...',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    source: 'naver',
    ...overrides,
  };
}

/**
 * Creates a mock RestaurantBlogsResponse
 */
export function createMockRestaurantBlogs(count: number = 3): RestaurantBlogsResponse {
  const blogs = Array.from({ length: count }, (_, index) =>
    createMockRestaurantBlog({
      title: `맛집 리뷰 ${index + 1}`,
      url: `https://blog.example.com/review${index + 1}`,
    })
  );

  return { blogs };
}

/**
 * Creates a mock MenuPayload with optional overrides
 */
export function createMockMenuPayload(overrides?: Partial<MenuPayload>): MenuPayload {
  return {
    breakfast: ['토스트', '커피'],
    lunch: ['김치찌개'],
    dinner: ['불고기'],
    etc: [],
    ...overrides,
  };
}

/**
 * Creates a mock MenuSelection with optional overrides
 */
export function createMockMenuSelection(overrides?: Partial<MenuSelection>): MenuSelection {
  return {
    id: 1,
    menuPayload: createMockMenuPayload(),
    selectedDate: new Date().toISOString().split('T')[0],
    historyId: 1,
    ...overrides,
  };
}

/**
 * Creates multiple mock menu selections
 */
export function createMockMenuSelections(count: number): MenuSelection[] {
  return Array.from({ length: count }, (_, index) =>
    createMockMenuSelection({
      id: index + 1,
      selectedDate: new Date(Date.now() - index * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      historyId: index % 2 === 0 ? index + 1 : null,
    })
  );
}

/**
 * Creates agent state for Redux store with menu data
 */
export function createAgentStateWithMenu(menuName?: string) {
  return {
    agent: {
      selectedMenu: menuName ?? null,
      restaurants: [],
      isSearching: false,
      aiRecommendations: {},
      aiLoading: {},
      showConfirmCard: false,
      menuRequestAddress: null,
    },
  };
}

/**
 * Creates agent state with restaurants
 */
export function createAgentStateWithRestaurants() {
  return {
    agent: {
      selectedMenu: '김치찌개',
      restaurants: [
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
      ],
      isSearching: false,
      aiRecommendations: {},
      aiLoading: {},
      showConfirmCard: false,
      menuRequestAddress: '서울시 강남구 테헤란로 123',
    },
  };
}
