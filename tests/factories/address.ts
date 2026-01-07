import type {
  AddressSearchResult,
  AddressSearchResponse,
  SelectedAddress,
  UserAddress,
} from '@/types/user';

/**
 * Creates a mock AddressSearchResult with optional overrides
 */
export function createMockAddressSearchResult(
  overrides?: Partial<AddressSearchResult>
): AddressSearchResult {
  return {
    address: '서울시 강남구 테헤란로 123',
    roadAddress: '서울특별시 강남구 테헤란로 123',
    postalCode: '06236',
    latitude: '37.5172',
    longitude: '127.0473',
    ...overrides,
  };
}

/**
 * Creates a mock AddressSearchResponse with specified count
 */
export function createMockAddressSearchResponse(
  count: number = 5
): AddressSearchResponse {
  const addresses = Array.from({ length: count }, (_, index) =>
    createMockAddressSearchResult({
      address: `서울시 강남구 테헤란로 ${(index + 1) * 100}`,
      roadAddress: `서울특별시 강남구 테헤란로 ${(index + 1) * 100}`,
      latitude: String(37.5172 + index * 0.001),
      longitude: String(127.0473 + index * 0.001),
    })
  );

  return {
    meta: {
      total_count: count,
      pageable_count: count,
      is_end: true,
    },
    addresses,
  };
}

/**
 * Creates a mock SelectedAddress with optional overrides
 */
export function createMockSelectedAddress(
  overrides?: Partial<SelectedAddress>
): SelectedAddress {
  return {
    address: '서울시 강남구 테헤란로 123',
    roadAddress: '서울특별시 강남구 테헤란로 123',
    postalCode: '06236',
    latitude: '37.5172',
    longitude: '127.0473',
    ...overrides,
  };
}

/**
 * Creates a mock UserAddress with optional overrides
 */
export function createMockUserAddress(overrides?: Partial<UserAddress>): UserAddress {
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
 * Creates multiple mock user addresses
 */
export function createMockUserAddresses(count: number): UserAddress[] {
  const aliases = ['회사', '집', '학교', '자주 가는 곳', '기타'];

  return Array.from({ length: count }, (_, index) =>
    createMockUserAddress({
      id: index + 1,
      roadAddress: `서울시 강남구 테헤란로 ${(index + 1) * 100}`,
      latitude: 37.5172 + index * 0.01,
      longitude: 127.0473 + index * 0.01,
      isDefault: index === 0,
      isSearchAddress: index === 0,
      alias: aliases[index % aliases.length],
      createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
    })
  );
}

/**
 * Creates an empty address search response
 */
export function createEmptyAddressSearchResponse(): AddressSearchResponse {
  return {
    meta: {
      total_count: 0,
      pageable_count: 0,
      is_end: true,
    },
    addresses: [],
  };
}

/**
 * Converts AddressSearchResult to SelectedAddress format
 */
export function addressSearchResultToSelected(
  result: AddressSearchResult
): SelectedAddress {
  return {
    address: result.address,
    roadAddress: result.roadAddress,
    postalCode: result.postalCode,
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

/**
 * Converts UserAddress to coordinate object
 */
export function userAddressToCoordinates(address: UserAddress) {
  return {
    latitude: address.latitude,
    longitude: address.longitude,
  };
}
