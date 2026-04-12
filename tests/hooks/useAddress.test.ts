/**
 * useAddressSearch 테스트
 * 검색(1개), 선택(1개), 초기화(1개), 에러(1개), 연속 검색(1개)
 */

import { renderHook, act } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '@tests/mocks/server';
import { useAddressSearch } from '@shared/hooks/address/useAddressSearch';
import { createMockAddressSearchResult } from '@tests/factories/address';
import { ToastProvider } from '@shared/components/ToastProvider';

const BASE_URL = 'http://localhost:3000';

// ────────────────────────────────────────────────────────────────────────────
// 공통 헬퍼
// ────────────────────────────────────────────────────────────────────────────

/** useAddressSearch 전용 래퍼 — ToastProvider만 필요 */
function toastWrapper({ children }: { children: ReactNode }) {
  return createElement(ToastProvider, null, children);
}

// ────────────────────────────────────────────────────────────────────────────
// useAddressSearch
// ────────────────────────────────────────────────────────────────────────────

describe('useAddressSearch', () => {
  describe('handleSearch', () => {
    it('검색어 입력 → API 호출 → 결과 반환', async () => {
      const { result } = renderHook(() => useAddressSearch(), {
        wrapper: toastWrapper,
      });

      act(() => {
        result.current.setAddressQuery('서울시 강남구');
      });

      await act(async () => {
        await result.current.handleSearch();
      });

      expect(result.current.searchResults.length).toBeGreaterThan(0);
      expect(result.current.hasSearchedAddress).toBe(true);
      expect(result.current.isSearching).toBe(false);
    });
  });

  describe('handleSelectAddress', () => {
    it('주소 선택 → selectedAddress 설정 + 검색결과·쿼리 초기화', async () => {
      const { result } = renderHook(() => useAddressSearch(), {
        wrapper: toastWrapper,
      });

      // 먼저 검색 실행
      act(() => {
        result.current.setAddressQuery('서울시 강남구');
      });
      await act(async () => {
        await result.current.handleSearch();
      });
      expect(result.current.searchResults.length).toBeGreaterThan(0);

      const target = createMockAddressSearchResult({
        address: '서울시 강남구 역삼동 100',
        roadAddress: '서울특별시 강남구 테헤란로 100',
        latitude: '37.5010',
        longitude: '127.0390',
      });

      act(() => {
        result.current.handleSelectAddress(target);
      });

      expect(result.current.selectedAddress).toMatchObject({
        address: target.address,
        roadAddress: target.roadAddress,
        latitude: target.latitude,
        longitude: target.longitude,
      });
      expect(result.current.searchResults).toHaveLength(0);
      expect(result.current.addressQuery).toBe('');
    });
  });

  describe('clearSearch', () => {
    it('clearSearch — 쿼리·검색결과·검색완료 플래그 초기화', async () => {
      const { result } = renderHook(() => useAddressSearch(), {
        wrapper: toastWrapper,
      });

      // 검색 실행하여 상태 채우기
      act(() => {
        result.current.setAddressQuery('서울');
      });
      await act(async () => {
        await result.current.handleSearch();
      });
      expect(result.current.hasSearchedAddress).toBe(true);

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.addressQuery).toBe('');
      expect(result.current.searchResults).toHaveLength(0);
      expect(result.current.hasSearchedAddress).toBe(false);
    });
  });

  describe('에러 시나리오', () => {
    it('검색 API 실패 시 에러 상태 처리', async () => {
      server.use(
        http.get(`${BASE_URL}/user/address/search`, () => {
          return HttpResponse.json(
            { message: '주소 검색에 실패했습니다.' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useAddressSearch(), {
        wrapper: toastWrapper,
      });

      act(() => {
        result.current.setAddressQuery('서울시 강남구');
      });

      await act(async () => {
        await result.current.handleSearch();
      });

      // 검색 실패 시 결과가 비어있고 로딩 해제
      expect(result.current.searchResults).toHaveLength(0);
      expect(result.current.isSearching).toBe(false);
    });
  });

  describe('빠른 연속 검색', () => {
    it('두 번 순차 검색 시 두 번째 검색 결과가 최종 상태에 반영됨', async () => {
      let callCount = 0;
      server.use(
        http.get(`${BASE_URL}/user/address/search`, ({ request }) => {
          callCount++;
          const url = new URL(request.url);
          const query = url.searchParams.get('query') || '';

          return HttpResponse.json({
            meta: { total_count: 1, pageable_count: 1, is_end: true },
            addresses: [
              createMockAddressSearchResult({
                address: `${query} 결과 주소`,
                roadAddress: `${query} 결과 도로명`,
              }),
            ],
          });
        })
      );

      const { result } = renderHook(() => useAddressSearch(), {
        wrapper: toastWrapper,
      });

      // 첫 번째 검색
      act(() => {
        result.current.setAddressQuery('서울시 강남구');
      });
      await act(async () => {
        await result.current.handleSearch();
      });
      expect(result.current.searchResults[0].address).toBe('서울시 강남구 결과 주소');

      // 두 번째 검색 (빠르게 연속)
      act(() => {
        result.current.setAddressQuery('부산시 해운대구');
      });
      await act(async () => {
        await result.current.handleSearch();
      });

      // 두 요청 모두 실행됨
      expect(callCount).toBe(2);
      // 두 번째 검색 결과가 최종 상태에 반영됨
      expect(result.current.searchResults).toHaveLength(1);
      expect(result.current.searchResults[0].address).toBe('부산시 해운대구 결과 주소');
      expect(result.current.hasSearchedAddress).toBe(true);
      expect(result.current.isSearching).toBe(false);
    });
  });
});

