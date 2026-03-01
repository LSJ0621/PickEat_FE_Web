import type { User, LoginResponse } from '@features/auth/types';
import type { MenuRecommendationItemData } from '@features/agent/types';
import type { UserAddress, Preferences, RecommendationHistoryItem } from '@features/user/types';

/**
 * Creates a mock User object with optional overrides
 */
export function createMockUser(overrides?: Partial<User>): User {
  return {
    email: 'test@example.com',
    name: 'Test User',
    address: '서울시 강남구 테헤란로 123',
    latitude: 37.5172,
    longitude: 127.0473,
    preferences: {
      likes: ['한식', '중식'],
      dislikes: ['매운 음식'],
      analysis: null,
    },
    preferredLanguage: 'ko',
    role: 'USER',
    createdAt: '2024-01-01T00:00:00.000Z',
    birthDate: null,
    gender: null,
    ...overrides,
  };
}

/**
 * Creates a mock LoginResponse object with optional overrides
 */
export function createMockLoginResponse(overrides?: Partial<LoginResponse>): LoginResponse {
  const user = createMockUser();
  return {
    token: 'mock-jwt-token',
    email: user.email,
    name: user.name,
    address: user.address ?? null,
    latitude: user.latitude ?? null,
    longitude: user.longitude ?? null,
    preferences: user.preferences ?? null,
    birthDate: null,
    gender: null,
    ...overrides,
  };
}

/**
 * Creates a mock UserAddress object with optional overrides
 */
export function createMockAddress(overrides?: Partial<UserAddress>): UserAddress {
  return {
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
    ...overrides,
  };
}

/**
 * Creates multiple mock addresses
 */
export function createMockAddresses(count: number): UserAddress[] {
  return Array.from({ length: count }, (_, index) =>
    createMockAddress({
      id: index + 1,
      roadAddress: `서울시 강남구 테헤란로 ${(index + 1) * 100}`,
      isDefault: index === 0,
      alias: index === 0 ? '회사' : index === 1 ? '집' : `주소 ${index + 1}`,
    })
  );
}

/**
 * Creates a mock Preferences object with optional overrides
 */
export function createMockPreferences(overrides?: Partial<Preferences>): Preferences {
  return {
    likes: ['한식', '중식', '일식'],
    dislikes: ['매운 음식', '생선'],
    analysis: '한식과 중식을 선호하며, 매운 음식은 피하는 편입니다.',
    ...overrides,
  };
}

/**
 * Creates a mock RecommendationHistoryItem with optional overrides
 */
export function createMockRecommendationHistory(
  overrides?: Partial<RecommendationHistoryItem>
): RecommendationHistoryItem {
  return {
    id: 1,
    recommendations: [
      { menu: '김치찌개', condition: '한식이 당긴다면' },
      { menu: '불고기', condition: '달콤한 맛이 좋다면' },
      { menu: '비빔밥', condition: '건강하게 먹고 싶다면' },
    ],
    prompt: '점심 메뉴 추천해줘',
    reason: '한식 중심의 건강한 메뉴를 추천드립니다.',
    recommendedAt: '2024-01-15T12:00:00.000Z',
    requestAddress: '서울시 강남구 테헤란로 123',
    hasPlaceRecommendations: true,
    ...overrides,
  };
}

/**
 * Creates multiple mock recommendation history items
 */
export function createMockRecommendationHistories(count: number): RecommendationHistoryItem[] {
  const prompts = [
    '점심 메뉴 추천해줘',
    '저녁으로 뭐 먹을까',
    '이탈리안 음식 추천해줘',
    '다이어트 음식 추천해줘',
    '간단한 아침 메뉴',
  ];

  const menus: MenuRecommendationItemData[][] = [
    [
      { menu: '김치찌개', condition: '한식이 당긴다면' },
      { menu: '불고기', condition: '달콤한 맛이 좋다면' },
      { menu: '비빔밥', condition: '건강하게 먹고 싶다면' },
    ],
    [
      { menu: '파스타', condition: '이탈리안이 땡긴다면' },
      { menu: '피자', condition: '간편하게 먹고 싶다면' },
      { menu: '리조또', condition: '크리미한 음식이 좋다면' },
    ],
    [
      { menu: '초밥', condition: '신선한 해산물을 원한다면' },
      { menu: '라멘', condition: '따뜻한 국물이 필요하다면' },
      { menu: '우동', condition: '담백하게 먹고 싶다면' },
    ],
    [
      { menu: '샐러드', condition: '다이어트 중이라면' },
      { menu: '닭가슴살', condition: '단백질이 필요하다면' },
      { menu: '아보카도', condition: '건강한 지방을 원한다면' },
    ],
    [
      { menu: '토스트', condition: '간단한 아침을 원한다면' },
      { menu: '시리얼', condition: '빠르게 먹고 싶다면' },
      { menu: '요거트', condition: '가볍게 먹고 싶다면' },
    ],
  ];

  return Array.from({ length: count }, (_, index) =>
    createMockRecommendationHistory({
      id: index + 1,
      prompt: prompts[index % prompts.length],
      recommendations: menus[index % menus.length],
      recommendedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
      hasPlaceRecommendations: index % 2 === 0,
    })
  );
}

/**
 * Creates authenticated state for Redux store
 */
export function createAuthenticatedState(userOverrides?: Partial<User>) {
  return {
    auth: {
      user: createMockUser(userOverrides),
      isAuthenticated: true,
      loading: false,
      error: null,
    },
  };
}

/**
 * Creates unauthenticated state for Redux store
 */
export function createUnauthenticatedState() {
  return {
    auth: {
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    },
  };
}
