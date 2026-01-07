import { describe, it, expect } from 'vitest';
import type {
  AddressSearchResult,
  AddressSearchResponse,
  SelectedAddress,
  SetAddressRequest,
  SetAddressResponse,
  Preferences,
  GetPreferencesResponse,
  SetPreferencesRequest,
  RecommendationLocation,
  RecommendationHistoryItem,
  PageInfo,
  GetRecommendationHistoryResponse,
  UserAddress,
  GetAddressesResponse,
  GetDefaultAddressResponse,
  CreateAddressRequest,
  UpdateAddressRequest,
  DeleteAddressResponse,
  BatchDeleteAddressRequest,
} from '@/types/user';

describe('AddressSearchResult', () => {
  it('should accept valid address search result', () => {
    const result: AddressSearchResult = {
      address: '서울시 강남구 테헤란로 123',
      roadAddress: '서울시 강남구 테헤란로 123',
      postalCode: '06234',
      latitude: '37.123456',
      longitude: '127.123456',
    };
    expect(result.address).toBe('서울시 강남구 테헤란로 123');
    expect(result.roadAddress).toBe('서울시 강남구 테헤란로 123');
    expect(result.postalCode).toBe('06234');
    expect(result.latitude).toBe('37.123456');
    expect(result.longitude).toBe('127.123456');
  });

  it('should accept null for optional fields', () => {
    const result: AddressSearchResult = {
      address: '서울시 강남구',
      roadAddress: null,
      postalCode: null,
      latitude: '37.123456',
      longitude: '127.123456',
    };
    expect(result.roadAddress).toBeNull();
    expect(result.postalCode).toBeNull();
  });

  it('should require all mandatory fields', () => {
    const result: AddressSearchResult = {
      address: '서울시 강남구',
      roadAddress: null,
      postalCode: null,
      latitude: '37.123456',
      longitude: '127.123456',
    };
    expect(result).toHaveProperty('address');
    expect(result).toHaveProperty('latitude');
    expect(result).toHaveProperty('longitude');
  });
});

describe('AddressSearchResponse', () => {
  it('should accept valid address search response', () => {
    const response: AddressSearchResponse = {
      meta: {
        total_count: 10,
        pageable_count: 10,
        is_end: true,
      },
      addresses: [
        {
          address: '서울시 강남구',
          roadAddress: '테헤란로 123',
          postalCode: '06234',
          latitude: '37.123456',
          longitude: '127.123456',
        },
      ],
    };
    expect(response.meta.total_count).toBe(10);
    expect(response.addresses).toHaveLength(1);
  });

  it('should accept empty addresses array', () => {
    const response: AddressSearchResponse = {
      meta: {
        total_count: 0,
        pageable_count: 0,
        is_end: true,
      },
      addresses: [],
    };
    expect(response.addresses).toHaveLength(0);
    expect(response.meta.total_count).toBe(0);
  });

  it('should require meta and addresses fields', () => {
    const response: AddressSearchResponse = {
      meta: {
        total_count: 1,
        pageable_count: 1,
        is_end: true,
      },
      addresses: [],
    };
    expect(response).toHaveProperty('meta');
    expect(response).toHaveProperty('addresses');
  });
});

describe('SelectedAddress', () => {
  it('should accept valid selected address', () => {
    const address: SelectedAddress = {
      address: '서울시 강남구',
      roadAddress: '테헤란로 123',
      postalCode: '06234',
      latitude: '37.123456',
      longitude: '127.123456',
    };
    expect(address.address).toBe('서울시 강남구');
    expect(address.roadAddress).toBe('테헤란로 123');
  });

  it('should accept null for optional fields', () => {
    const address: SelectedAddress = {
      address: '서울시 강남구',
      roadAddress: null,
      postalCode: null,
      latitude: '37.123456',
      longitude: '127.123456',
    };
    expect(address.roadAddress).toBeNull();
    expect(address.postalCode).toBeNull();
  });
});

describe('SetAddressRequest', () => {
  it('should accept valid set address request', () => {
    const request: SetAddressRequest = {
      selectedAddress: {
        address: '서울시 강남구',
        roadAddress: '테헤란로 123',
        postalCode: '06234',
        latitude: '37.123456',
        longitude: '127.123456',
      },
    };
    expect(request.selectedAddress.address).toBe('서울시 강남구');
  });

  it('should require selectedAddress field', () => {
    const request: SetAddressRequest = {
      selectedAddress: {
        address: '서울시 강남구',
        roadAddress: null,
        postalCode: null,
        latitude: '37.123456',
        longitude: '127.123456',
      },
    };
    expect(request).toHaveProperty('selectedAddress');
  });
});

describe('SetAddressResponse', () => {
  it('should accept valid set address response', () => {
    const response: SetAddressResponse = {
      id: 1,
      roadAddress: '테헤란로 123',
      postalCode: '06234',
      latitude: 37.123456,
      longitude: 127.123456,
      isDefault: true,
      isSearchAddress: false,
      alias: '집',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };
    expect(response.id).toBe(1);
    expect(response.roadAddress).toBe('테헤란로 123');
    expect(response.isDefault).toBe(true);
  });

  it('should accept null for optional fields', () => {
    const response: SetAddressResponse = {
      id: 1,
      roadAddress: '테헤란로 123',
      postalCode: null,
      latitude: 37.123456,
      longitude: 127.123456,
      isDefault: false,
      isSearchAddress: true,
      alias: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(response.postalCode).toBeNull();
    expect(response.alias).toBeNull();
  });
});

describe('Preferences', () => {
  it('should accept valid preferences', () => {
    const prefs: Preferences = {
      likes: ['한식', '중식', '일식'],
      dislikes: ['매운음식', '생선'],
      analysis: 'AI 분석 결과입니다.',
    };
    expect(prefs.likes).toHaveLength(3);
    expect(prefs.dislikes).toHaveLength(2);
    expect(prefs.analysis).toBe('AI 분석 결과입니다.');
  });

  it('should accept empty arrays', () => {
    const prefs: Preferences = {
      likes: [],
      dislikes: [],
    };
    expect(prefs.likes).toHaveLength(0);
    expect(prefs.dislikes).toHaveLength(0);
    expect(prefs.analysis).toBeUndefined();
  });

  it('should accept null analysis', () => {
    const prefs: Preferences = {
      likes: ['한식'],
      dislikes: [],
      analysis: null,
    };
    expect(prefs.analysis).toBeNull();
  });
});

describe('GetPreferencesResponse', () => {
  it('should accept valid get preferences response', () => {
    const response: GetPreferencesResponse = {
      preferences: {
        likes: ['한식'],
        dislikes: ['매운음식'],
        analysis: 'AI 분석',
      },
    };
    expect(response.preferences.likes).toHaveLength(1);
    expect(response.preferences.dislikes).toHaveLength(1);
  });

  it('should require preferences field', () => {
    const response: GetPreferencesResponse = {
      preferences: {
        likes: [],
        dislikes: [],
      },
    };
    expect(response).toHaveProperty('preferences');
  });
});

describe('SetPreferencesRequest', () => {
  it('should accept request with all fields', () => {
    const request: SetPreferencesRequest = {
      likes: ['한식', '중식'],
      dislikes: ['매운음식'],
    };
    expect(request.likes).toHaveLength(2);
    expect(request.dislikes).toHaveLength(1);
  });

  it('should accept request with only likes', () => {
    const request: SetPreferencesRequest = {
      likes: ['한식'],
    };
    expect(request.likes).toHaveLength(1);
    expect(request.dislikes).toBeUndefined();
  });

  it('should accept request with only dislikes', () => {
    const request: SetPreferencesRequest = {
      dislikes: ['매운음식'],
    };
    expect(request.likes).toBeUndefined();
    expect(request.dislikes).toHaveLength(1);
  });

  it('should accept empty request', () => {
    const request: SetPreferencesRequest = {};
    expect(request.likes).toBeUndefined();
    expect(request.dislikes).toBeUndefined();
  });
});

describe('RecommendationLocation', () => {
  it('should accept valid recommendation location', () => {
    const location: RecommendationLocation = {
      lat: 37.123456,
      lng: 127.123456,
    };
    expect(location.lat).toBe(37.123456);
    expect(location.lng).toBe(127.123456);
  });

  it('should require both lat and lng fields', () => {
    const location: RecommendationLocation = {
      lat: 37.123456,
      lng: 127.123456,
    };
    expect(location).toHaveProperty('lat');
    expect(location).toHaveProperty('lng');
  });
});

describe('RecommendationHistoryItem', () => {
  it('should accept valid recommendation history item', () => {
    const item: RecommendationHistoryItem = {
      id: 1,
      recommendations: ['김치찌개', '된장찌개', '비빔밥'],
      prompt: '오늘 점심 추천해줘',
      reason: '한국 전통 음식을 추천합니다.',
      recommendedAt: '2024-01-01T12:00:00.000Z',
      requestAddress: '서울시 강남구',
      hasPlaceRecommendations: true,
    };
    expect(item.id).toBe(1);
    expect(item.recommendations).toHaveLength(3);
    expect(item.hasPlaceRecommendations).toBe(true);
  });

  it('should accept null requestAddress', () => {
    const item: RecommendationHistoryItem = {
      id: 1,
      recommendations: ['김치찌개'],
      prompt: '점심 추천',
      reason: '한식 추천',
      recommendedAt: '2024-01-01T12:00:00.000Z',
      requestAddress: null,
      hasPlaceRecommendations: false,
    };
    expect(item.requestAddress).toBeNull();
  });

  it('should require all mandatory fields', () => {
    const item: RecommendationHistoryItem = {
      id: 1,
      recommendations: ['김치찌개'],
      prompt: '점심 추천',
      reason: '한식 추천',
      recommendedAt: '2024-01-01T12:00:00.000Z',
      requestAddress: null,
      hasPlaceRecommendations: false,
    };
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('recommendations');
    expect(item).toHaveProperty('prompt');
    expect(item).toHaveProperty('reason');
    expect(item).toHaveProperty('recommendedAt');
    expect(item).toHaveProperty('hasPlaceRecommendations');
  });
});

describe('PageInfo', () => {
  it('should accept valid page info', () => {
    const pageInfo: PageInfo = {
      page: 1,
      limit: 10,
      totalCount: 100,
      hasNext: true,
    };
    expect(pageInfo.page).toBe(1);
    expect(pageInfo.limit).toBe(10);
    expect(pageInfo.totalCount).toBe(100);
    expect(pageInfo.hasNext).toBe(true);
  });

  it('should require all fields', () => {
    const pageInfo: PageInfo = {
      page: 1,
      limit: 10,
      totalCount: 100,
      hasNext: false,
    };
    expect(pageInfo).toHaveProperty('page');
    expect(pageInfo).toHaveProperty('limit');
    expect(pageInfo).toHaveProperty('totalCount');
    expect(pageInfo).toHaveProperty('hasNext');
  });
});

describe('GetRecommendationHistoryResponse', () => {
  it('should accept valid recommendation history response', () => {
    const response: GetRecommendationHistoryResponse = {
      items: [
        {
          id: 1,
          recommendations: ['김치찌개'],
          prompt: '점심 추천',
          reason: '한식 추천',
          recommendedAt: '2024-01-01T12:00:00.000Z',
          requestAddress: '서울시 강남구',
          hasPlaceRecommendations: true,
        },
      ],
      pageInfo: {
        page: 1,
        limit: 10,
        totalCount: 1,
        hasNext: false,
      },
    };
    expect(response.items).toHaveLength(1);
    expect(response.pageInfo.totalCount).toBe(1);
  });

  it('should accept empty items array', () => {
    const response: GetRecommendationHistoryResponse = {
      items: [],
      pageInfo: {
        page: 1,
        limit: 10,
        totalCount: 0,
        hasNext: false,
      },
    };
    expect(response.items).toHaveLength(0);
  });
});

describe('UserAddress', () => {
  it('should accept valid user address', () => {
    const address: UserAddress = {
      id: 1,
      roadAddress: '테헤란로 123',
      postalCode: '06234',
      latitude: 37.123456,
      longitude: 127.123456,
      isDefault: true,
      isSearchAddress: false,
      alias: '집',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    expect(address.id).toBe(1);
    expect(address.roadAddress).toBe('테헤란로 123');
    expect(address.isDefault).toBe(true);
  });

  it('should accept null for optional fields', () => {
    const address: UserAddress = {
      id: 1,
      roadAddress: '테헤란로 123',
      postalCode: null,
      latitude: 37.123456,
      longitude: 127.123456,
      isDefault: false,
      isSearchAddress: true,
      alias: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    expect(address.postalCode).toBeNull();
    expect(address.alias).toBeNull();
  });
});

describe('GetAddressesResponse', () => {
  it('should accept valid get addresses response', () => {
    const response: GetAddressesResponse = {
      addresses: [
        {
          id: 1,
          roadAddress: '테헤란로 123',
          postalCode: '06234',
          latitude: 37.123456,
          longitude: 127.123456,
          isDefault: true,
          isSearchAddress: false,
          alias: '집',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    };
    expect(response.addresses).toHaveLength(1);
  });

  it('should accept empty addresses array', () => {
    const response: GetAddressesResponse = {
      addresses: [],
    };
    expect(response.addresses).toHaveLength(0);
  });
});

describe('GetDefaultAddressResponse', () => {
  it('should accept response with address', () => {
    const response: GetDefaultAddressResponse = {
      address: {
        id: 1,
        roadAddress: '테헤란로 123',
        postalCode: '06234',
        latitude: 37.123456,
        longitude: 127.123456,
        isDefault: true,
        isSearchAddress: false,
        alias: '집',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    };
    expect(response.address).not.toBeNull();
    expect(response.address?.id).toBe(1);
  });

  it('should accept response with null address', () => {
    const response: GetDefaultAddressResponse = {
      address: null,
    };
    expect(response.address).toBeNull();
  });
});

describe('CreateAddressRequest', () => {
  it('should accept request with all fields', () => {
    const request: CreateAddressRequest = {
      selectedAddress: {
        address: '서울시 강남구',
        roadAddress: '테헤란로 123',
        postalCode: '06234',
        latitude: '37.123456',
        longitude: '127.123456',
      },
      alias: '집',
      isDefault: true,
      isSearchAddress: false,
    };
    expect(request.selectedAddress.address).toBe('서울시 강남구');
    expect(request.alias).toBe('집');
    expect(request.isDefault).toBe(true);
  });

  it('should accept request without optional fields', () => {
    const request: CreateAddressRequest = {
      selectedAddress: {
        address: '서울시 강남구',
        roadAddress: '테헤란로 123',
        postalCode: '06234',
        latitude: '37.123456',
        longitude: '127.123456',
      },
    };
    expect(request.alias).toBeUndefined();
    expect(request.isDefault).toBeUndefined();
    expect(request.isSearchAddress).toBeUndefined();
  });
});

describe('UpdateAddressRequest', () => {
  it('should accept request with all fields', () => {
    const request: UpdateAddressRequest = {
      roadAddress: '테헤란로 456',
      latitude: 37.654321,
      longitude: 127.654321,
      alias: '회사',
      isDefault: false,
      isSearchAddress: true,
    };
    expect(request.roadAddress).toBe('테헤란로 456');
    expect(request.alias).toBe('회사');
  });

  it('should accept partial update request', () => {
    const request: UpdateAddressRequest = {
      alias: '회사',
    };
    expect(request.alias).toBe('회사');
    expect(request.roadAddress).toBeUndefined();
  });

  it('should accept empty update request', () => {
    const request: UpdateAddressRequest = {};
    expect(Object.keys(request)).toHaveLength(0);
  });
});

describe('DeleteAddressResponse', () => {
  it('should accept valid delete address response', () => {
    const response: DeleteAddressResponse = {
      message: '주소가 삭제되었습니다.',
    };
    expect(response.message).toBe('주소가 삭제되었습니다.');
  });

  it('should require message field', () => {
    const response: DeleteAddressResponse = {
      message: 'Deleted',
    };
    expect(response).toHaveProperty('message');
  });
});

describe('BatchDeleteAddressRequest', () => {
  it('should accept valid batch delete request', () => {
    const request: BatchDeleteAddressRequest = {
      ids: [1, 2, 3, 4, 5],
    };
    expect(request.ids).toHaveLength(5);
    expect(request.ids).toContain(1);
    expect(request.ids).toContain(5);
  });

  it('should accept single id', () => {
    const request: BatchDeleteAddressRequest = {
      ids: [1],
    };
    expect(request.ids).toHaveLength(1);
  });

  it('should accept empty ids array', () => {
    const request: BatchDeleteAddressRequest = {
      ids: [],
    };
    expect(request.ids).toHaveLength(0);
  });

  it('should require ids field', () => {
    const request: BatchDeleteAddressRequest = {
      ids: [1, 2],
    };
    expect(request).toHaveProperty('ids');
  });
});
