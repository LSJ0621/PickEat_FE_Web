/**
 * usePlaceDetails 테스트
 * 장소 상세 정보 로딩, 상태 전환, 에러 처리, placeId 변경 검증
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@tests/mocks/server';
import { usePlaceDetails } from '@features/agent/hooks/usePlaceDetails';
import { mockPlaceDetail } from '@tests/mocks/handlers/menu';

const BASE_URL = 'http://localhost:3000';

describe('usePlaceDetails', () => {
  it('placeId null — idle 상태, placeDetail null', () => {
    const { result } = renderHook(() => usePlaceDetails(null));

    expect(result.current.status).toBe('idle');
    expect(result.current.placeDetail).toBeNull();
    expect(result.current.errorMessage).toBeNull();
  });

  it('유효한 placeId — loading → ready 전환 + placeDetail 설정', async () => {
    const { result } = renderHook(() => usePlaceDetails('ChIJ1234567890'));

    // loading 상태를 거쳐야 함
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    expect(result.current.placeDetail).not.toBeNull();
    expect(result.current.placeDetail?.name).toBe(mockPlaceDetail.place.name);
    expect(result.current.errorMessage).toBeNull();
  });

  it('존재하지 않는 placeId — error 상태 + errorMessage 설정', async () => {
    const { result } = renderHook(() => usePlaceDetails('invalid-place'));

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.placeDetail).toBeNull();
    expect(result.current.errorMessage).not.toBeNull();
  });

  it('API 서버 오류 — error 상태', async () => {
    server.use(
      http.get(`${BASE_URL}/menu/places/:placeId/detail`, () => {
        return HttpResponse.json(
          { message: '서버 내부 오류' },
          { status: 500 }
        );
      })
    );

    const { result } = renderHook(() => usePlaceDetails('ChIJ1234567890'));

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.errorMessage).not.toBeNull();
  });

  it('placeId 변경 — 새 데이터 로딩', async () => {
    const { result, rerender } = renderHook(
      ({ placeId }) => usePlaceDetails(placeId),
      { initialProps: { placeId: 'ChIJ1234567890' as string | null } }
    );

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    expect(result.current.placeDetail?.id).toBe('ChIJ1234567890');

    // 다른 placeId로 변경
    rerender({ placeId: 'ChIJ0987654321' });

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
      expect(result.current.placeDetail?.id).toBe('ChIJ0987654321');
    });
  });

  it('placeId → null 변경 — idle로 복귀', async () => {
    const { result, rerender } = renderHook(
      ({ placeId }) => usePlaceDetails(placeId),
      { initialProps: { placeId: 'ChIJ1234567890' as string | null } }
    );

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    rerender({ placeId: null });

    expect(result.current.status).toBe('idle');
    expect(result.current.placeDetail).toBeNull();
  });
});
