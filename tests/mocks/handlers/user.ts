import { http, HttpResponse } from 'msw';
import { ENDPOINTS } from '@shared/api/endpoints';
import type {
  AddressSearchResponse,
  DeleteAccountResponse,
  GetAddressesResponse,
  GetDefaultAddressResponse,
  SetAddressResponse,
  GetPreferencesResponse,
  GetRecommendationHistoryResponse,
  DeleteAddressResponse,
  UserAddress,
} from '@features/user/types';
import type { UpdateUserResponse } from '@features/auth/types';
import type { MenuRecommendationItemData } from '@features/agent/types';

const BASE_URL = 'http://localhost:3000';

// Mock addresses
export const mockAddresses: UserAddress[] = [
  {
    id: 1,
    roadAddress: '서울시 강남구 테헤란로 123',
    postalCode: '06236',
    latitude: 37.5172,
    longitude: 127.0473,
    isDefault: true,
    isSearchAddress: true,
    alias: '회사',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    roadAddress: '서울시 서초구 서초대로 456',
    postalCode: '06621',
    latitude: 37.4969,
    longitude: 127.0278,
    isDefault: false,
    isSearchAddress: false,
    alias: '집',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

export const mockPreferences = {
  likes: ['한식', '중식', '일식'],
  dislikes: ['매운 음식', '생선'],
  analysis: '한식과 중식을 선호하며, 매운 음식은 피하는 편입니다.',
};

export const userHandlers = [
  // Update user (PUT)
  http.put(`${BASE_URL}${ENDPOINTS.USER.UPDATE}`, async ({ request }) => {
    const body = (await request.json()) as { name?: string };

    const response: UpdateUserResponse = {
      name: body.name ?? null,
    };
    return HttpResponse.json(response);
  }),

  // Update user (PATCH) — authService.updateUser가 사용하는 메서드
  http.patch(`${BASE_URL}${ENDPOINTS.USER.UPDATE}`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as { name?: string };
    const response: UpdateUserResponse = {
      name: body.name ?? null,
    };
    return HttpResponse.json(response);
  }),

  // Delete account
  http.delete(`${BASE_URL}${ENDPOINTS.USER.DELETE}`, () => {
    const response: DeleteAccountResponse = {
      message: '계정이 삭제되었습니다.',
    };
    return HttpResponse.json(response);
  }),

  // Search address
  http.get(`${BASE_URL}${ENDPOINTS.USER.ADDRESS_SEARCH}`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');

    if (!query || query.length < 2) {
      return HttpResponse.json(
        { message: '검색어는 2글자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    const response: AddressSearchResponse = {
      meta: {
        total_count: 2,
        pageable_count: 2,
        is_end: true,
      },
      addresses: [
        {
          address: '서울시 강남구 테헤란로 123',
          roadAddress: '서울특별시 강남구 테헤란로 123',
          postalCode: '06236',
          latitude: '37.5172',
          longitude: '127.0473',
        },
        {
          address: '서울시 강남구 테헤란로 456',
          roadAddress: '서울특별시 강남구 테헤란로 456',
          postalCode: '06236',
          latitude: '37.5180',
          longitude: '127.0480',
        },
      ],
    };
    return HttpResponse.json(response);
  }),

  // Get addresses list
  http.get(`${BASE_URL}${ENDPOINTS.USER.ADDRESSES}`, () => {
    const response: GetAddressesResponse = {
      addresses: mockAddresses,
    };
    return HttpResponse.json(response);
  }),

  // Get default address
  http.get(`${BASE_URL}${ENDPOINTS.USER.ADDRESS_DEFAULT}`, () => {
    const defaultAddress = mockAddresses.find((addr) => addr.isDefault);
    const response: GetDefaultAddressResponse = {
      address: defaultAddress ?? null,
    };
    return HttpResponse.json(response);
  }),

  // Create address
  http.post(`${BASE_URL}${ENDPOINTS.USER.ADDRESSES}`, async ({ request }) => {
    const body = (await request.json()) as {
      selectedAddress: {
        address: string;
        roadAddress: string | null;
        latitude: string;
        longitude: string;
      };
      alias?: string;
      isDefault?: boolean;
    };

    const response: SetAddressResponse = {
      id: 3,
      roadAddress: body.selectedAddress.roadAddress ?? body.selectedAddress.address,
      postalCode: null,
      latitude: parseFloat(body.selectedAddress.latitude),
      longitude: parseFloat(body.selectedAddress.longitude),
      isDefault: body.isDefault ?? false,
      isSearchAddress: false,
      alias: body.alias ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(response, { status: 201 });
  }),

  // Set default address
  http.patch(`${BASE_URL}${ENDPOINTS.USER.ADDRESSES}/:id/default`, ({ params }) => {
    const { id } = params;
    const address = mockAddresses.find((addr) => addr.id === Number(id));

    if (!address) {
      return HttpResponse.json(
        { message: '주소를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const response: SetAddressResponse = {
      ...address,
      isDefault: true,
      createdAt: new Date(address.createdAt).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(response);
  }),

  // Set search address
  http.put(`${BASE_URL}${ENDPOINTS.USER.ADDRESSES}/:id/search`, ({ params }) => {
    const { id } = params;
    const address = mockAddresses.find((addr) => addr.id === Number(id));

    if (!address) {
      return HttpResponse.json(
        { message: '주소를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const response: SetAddressResponse = {
      ...address,
      isSearchAddress: true,
      createdAt: new Date(address.createdAt).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(response);
  }),

  // Delete address
  http.delete(`${BASE_URL}${ENDPOINTS.USER.ADDRESSES}/:id`, ({ params }) => {
    const { id } = params;
    const address = mockAddresses.find((addr) => addr.id === Number(id));

    if (!address) {
      return HttpResponse.json(
        { message: '주소를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const response: DeleteAddressResponse = {
      message: '주소가 삭제되었습니다.',
    };
    return HttpResponse.json(response);
  }),

  // Batch delete addresses
  http.post(`${BASE_URL}${ENDPOINTS.USER.ADDRESSES_BATCH_DELETE}`, async ({ request }) => {
    const body = (await request.json()) as { ids: number[] };

    if (!body.ids || body.ids.length === 0) {
      return HttpResponse.json(
        { message: '삭제할 주소를 선택해주세요.' },
        { status: 400 }
      );
    }

    const response: DeleteAddressResponse = {
      message: `${body.ids.length}개의 주소가 삭제되었습니다.`,
    };
    return HttpResponse.json(response);
  }),

  // Get preferences
  http.get(`${BASE_URL}${ENDPOINTS.USER.PREFERENCES}`, () => {
    const response: GetPreferencesResponse = {
      preferences: mockPreferences,
    };
    return HttpResponse.json(response);
  }),

  // Set preferences
  http.post(`${BASE_URL}${ENDPOINTS.USER.PREFERENCES}`, async ({ request }) => {
    const body = (await request.json()) as {
      likes?: string[];
      dislikes?: string[];
    };

    const response: GetPreferencesResponse = {
      preferences: {
        likes: body.likes ?? mockPreferences.likes,
        dislikes: body.dislikes ?? mockPreferences.dislikes,
        analysis: mockPreferences.analysis,
      },
    };
    return HttpResponse.json(response);
  }),

  // Get recommendation history
  http.get(`${BASE_URL}${ENDPOINTS.RECOMMENDATION_HISTORY}`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1');
    const limit = parseInt(url.searchParams.get('limit') ?? '10');

    const response: GetRecommendationHistoryResponse = {
      items: [
        {
          id: 1,
          recommendations: [
            { menu: '김치찌개', condition: '한식이 당긴다면' },
            { menu: '불고기', condition: '달콤한 맛이 좋다면' },
            { menu: '비빔밥', condition: '건강하게 먹고 싶다면' },
          ] satisfies MenuRecommendationItemData[],
          prompt: '점심 메뉴 추천해줘',
          reason: '한식 중심의 건강한 메뉴를 추천드립니다.',
          recommendedAt: '2024-01-15T12:00:00.000Z',
          requestAddress: '서울시 강남구 테헤란로 123',
          hasPlaceRecommendations: true,
        },
        {
          id: 2,
          recommendations: [
            { menu: '파스타', condition: '이탈리안이 땡긴다면' },
            { menu: '피자', condition: '간편하게 먹고 싶다면' },
            { menu: '리조또', condition: '크리미한 음식이 좋다면' },
          ] satisfies MenuRecommendationItemData[],
          prompt: '이탈리안 음식 먹고 싶어',
          reason: '인기있는 이탈리안 메뉴를 추천드립니다.',
          recommendedAt: '2024-01-14T18:00:00.000Z',
          requestAddress: '서울시 강남구 테헤란로 123',
          hasPlaceRecommendations: false,
        },
      ],
      pageInfo: {
        page,
        limit,
        totalCount: 2,
        hasNext: false,
      },
    };
    return HttpResponse.json(response);
  }),
];
