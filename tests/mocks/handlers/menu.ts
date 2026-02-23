import { http, HttpResponse } from 'msw';
import { ENDPOINTS } from '@shared/api/endpoints';
import type {
  MenuRecommendationResponse,
  PlaceRecommendationResponse,
  RestaurantBlogsResponse,
  PlaceHistoryResponse,
  PlaceDetailResponse,
  CreateMenuSelectionResponse,
  GetMenuSelectionsResponse,
  UpdateMenuSelectionResponse,
  MenuSelection,
} from '@features/agent/types';

const BASE_URL = 'http://localhost:3000';

// Mock data
export const mockMenuRecommendation: MenuRecommendationResponse = {
  id: 1,
  recommendations: [
    { condition: '매콤달콤한 맛을 원한다면', menu: '김치찌개' },
    { condition: '고소하고 담백한 맛을 원한다면', menu: '불고기' },
    { condition: '건강한 한 끼를 원한다면', menu: '비빔밥' },
  ],
  intro: '한식 중심의 건강한 메뉴를 추천드립니다. 오늘 날씨가 쌀쌀하니 따뜻한 김치찌개가 좋을 것 같습니다.',
  closing: '지금 가장 끌리는 조건을 떠올려 보시고 선택해 보세요.',
  recommendedAt: new Date().toISOString(),
  requestAddress: '서울시 강남구 테헤란로 123',
};

export const mockPlaceRecommendations: PlaceRecommendationResponse = {
  recommendations: [
    {
      placeId: 'ChIJ1234567890',
      name: '명동 김치찌개',
      reason: '전통적인 김치찌개 맛집으로 유명합니다.',
      menuName: '김치찌개',
    },
    {
      placeId: 'ChIJ0987654321',
      name: '강남 불고기',
      reason: '고급 한우를 사용한 불고기 전문점입니다.',
      menuName: '불고기',
    },
  ],
};

export const mockRestaurantBlogs: RestaurantBlogsResponse = {
  blogs: [
    {
      title: '명동 김치찌개 맛집 리뷰',
      url: 'https://blog.example.com/review1',
      snippet: '정말 맛있는 김치찌개를 먹었습니다...',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      source: 'naver',
    },
    {
      title: '강남 불고기 솔직 후기',
      url: 'https://blog.example.com/review2',
      snippet: '분위기도 좋고 고기도 맛있어요...',
      thumbnailUrl: 'https://example.com/thumb2.jpg',
      source: 'naver',
    },
  ],
};

export const mockPlaceHistory: PlaceHistoryResponse = {
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
  places: [
    {
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
      reviews: [
        {
          rating: 5,
          text: '정말 맛있어요!',
          authorName: '홍길동',
          publishTime: '2024-01-10T12:00:00.000Z',
        },
      ],
    },
  ],
};

export const mockPlaceDetail: PlaceDetailResponse = {
  place: {
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
    reviews: [
      {
        rating: 5,
        text: '정말 맛있어요!',
        authorName: '홍길동',
        publishTime: '2024-01-10T12:00:00.000Z',
      },
      {
        rating: 4,
        text: '괜찮았습니다.',
        authorName: '김영희',
        publishTime: '2024-01-08T18:00:00.000Z',
      },
    ],
  },
};

export const mockMenuSelections: MenuSelection[] = [
  {
    id: 1,
    menuPayload: {
      breakfast: ['토스트', '커피'],
      lunch: ['김치찌개'],
      dinner: ['불고기'],
      etc: [],
    },
    selectedDate: '2024-01-15',
    historyId: 1,
  },
  {
    id: 2,
    menuPayload: {
      breakfast: [],
      lunch: ['파스타'],
      dinner: ['피자'],
      etc: ['아이스크림'],
    },
    selectedDate: '2024-01-14',
    historyId: null,
  },
];

export const menuHandlers = [
  // Menu recommendation
  http.post(`${BASE_URL}${ENDPOINTS.MENU.RECOMMEND}`, async ({ request }) => {
    const body = (await request.json()) as { prompt: string };

    if (!body.prompt || body.prompt.trim().length === 0) {
      return HttpResponse.json(
        { message: '프롬프트를 입력해주세요.' },
        { status: 400 }
      );
    }

    return HttpResponse.json(mockMenuRecommendation);
  }),

  // Place recommendations
  http.get(`${BASE_URL}${ENDPOINTS.MENU.RECOMMEND_PLACES}`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    const menuName = url.searchParams.get('menuName');

    if (!query && !menuName) {
      return HttpResponse.json(
        { message: '검색어 또는 메뉴 이름을 입력해주세요.' },
        { status: 400 }
      );
    }

    return HttpResponse.json(mockPlaceRecommendations);
  }),

  // Restaurant blogs
  http.get(`${BASE_URL}${ENDPOINTS.MENU.RESTAURANT_BLOGS}`, ({ request }) => {
    const url = new URL(request.url);
    const placeName = url.searchParams.get('placeName');

    if (!placeName) {
      return HttpResponse.json(
        { message: '가게 이름을 입력해주세요.' },
        { status: 400 }
      );
    }

    return HttpResponse.json(mockRestaurantBlogs);
  }),

  // Recommendation detail (place history)
  http.get(`${BASE_URL}/menu/recommendations/:id`, ({ params }) => {
    const { id } = params;

    if (id === '999') {
      return HttpResponse.json(
        { message: '추천 이력을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      ...mockPlaceHistory,
      history: { ...mockPlaceHistory.history, id: Number(id) },
    });
  }),

  // Place detail
  http.get(`${BASE_URL}/menu/places/:placeId/detail`, ({ params }) => {
    const { placeId } = params;

    if (placeId === 'invalid-place') {
      return HttpResponse.json(
        { message: '장소를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      ...mockPlaceDetail,
      place: { ...mockPlaceDetail.place, id: placeId as string },
    });
  }),

  // Create menu selection
  http.post(`${BASE_URL}${ENDPOINTS.MENU.SELECTIONS}`, async ({ request }) => {
    const body = (await request.json()) as {
      menus: { slot: string; name: string }[];
      historyId?: number;
    };

    if (!body.menus || body.menus.length === 0) {
      return HttpResponse.json(
        { message: '메뉴를 선택해주세요.' },
        { status: 400 }
      );
    }

    const menuPayload = {
      breakfast: [] as string[],
      lunch: [] as string[],
      dinner: [] as string[],
      etc: [] as string[],
    };

    body.menus.forEach((menu) => {
      const slot = menu.slot as keyof typeof menuPayload;
      if (menuPayload[slot]) {
        menuPayload[slot].push(menu.name);
      }
    });

    const response: CreateMenuSelectionResponse = {
      selection: {
        id: 3,
        menuPayload,
        selectedDate: new Date().toISOString().split('T')[0],
        historyId: body.historyId ?? null,
      },
    };
    return HttpResponse.json(response, { status: 201 });
  }),

  // Get menu selections
  http.get(`${BASE_URL}${ENDPOINTS.MENU.SELECTIONS}`, ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');

    let selections = mockMenuSelections;
    if (date) {
      selections = mockMenuSelections.filter((s) => s.selectedDate === date);
    }

    const response: GetMenuSelectionsResponse = {
      selections,
    };
    return HttpResponse.json(response);
  }),

  // Get menu selections history
  http.get(`${BASE_URL}${ENDPOINTS.MENU.SELECTIONS_HISTORY}`, ({ request }) => {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    let selections = mockMenuSelections;
    if (startDate && endDate) {
      selections = mockMenuSelections.filter((s) => {
        return s.selectedDate >= startDate && s.selectedDate <= endDate;
      });
    }

    const response: GetMenuSelectionsResponse = {
      selections,
    };
    return HttpResponse.json(response);
  }),

  // Update menu selection (PATCH)
  http.patch(`${BASE_URL}/menu/selections/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as {
      breakfast?: string[];
      lunch?: string[];
      dinner?: string[];
      etc?: string[];
      cancel?: boolean;
    };

    const selection = mockMenuSelections.find((s) => s.id === Number(id));
    if (!selection) {
      return HttpResponse.json(
        { message: '메뉴 선택을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (body.cancel) {
      return HttpResponse.json({ message: '메뉴 선택이 취소되었습니다.' });
    }

    const response: UpdateMenuSelectionResponse = {
      selection: {
        ...selection,
        menuPayload: {
          breakfast: body.breakfast ?? selection.menuPayload.breakfast,
          lunch: body.lunch ?? selection.menuPayload.lunch,
          dinner: body.dinner ?? selection.menuPayload.dinner,
          etc: body.etc ?? selection.menuPayload.etc,
        },
      },
    };
    return HttpResponse.json(response);
  }),
];
