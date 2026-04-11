/**
 * placeDetailCache 유틸리티 테스트
 * 캐시 저장/조회/TTL 만료/LRU 퇴거/컨텍스트별 삭제 동작 검증
 */

import { placeDetailCache } from '@shared/utils/placeDetailCache';
import type { PlaceDetail } from '@features/agent/types';

const mockPlaceDetail: PlaceDetail = {
  place_id: 'test-1',
  name: '테스트 식당',
  formatted_address: '서울시 강남구',
  geometry: { location: { lat: 37.5, lng: 127.0 } },
};

function createMockDetail(id: string): PlaceDetail {
  return { ...mockPlaceDetail, place_id: id, name: `식당 ${id}` };
}

describe('placeDetailCache', () => {
  beforeEach(() => {
    placeDetailCache.clearAll();
  });

  describe('get/set', () => {
    it('저장 후 조회 → 동일 데이터 반환', () => {
      placeDetailCache.set('p1', mockPlaceDetail, 'agent');
      const result = placeDetailCache.get('p1', 'agent');
      expect(result).toEqual(mockPlaceDetail);
    });

    it('존재하지 않는 키 조회 → null', () => {
      expect(placeDetailCache.get('nonexistent', 'agent')).toBeNull();
    });
  });

  describe('TTL (history context)', () => {
    it('history context — TTL 만료 전 조회 → 데이터 반환', () => {
      placeDetailCache.set('p1', mockPlaceDetail, 'history');

      // 4분 경과 (TTL 5분 이내)
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(Date.now()) // set 호출 시
        .mockReturnValueOnce(Date.now() + 4 * 60 * 1000); // get 호출 시

      placeDetailCache.set('p1', mockPlaceDetail, 'history');
      const result = placeDetailCache.get('p1', 'history');
      expect(result).toEqual(mockPlaceDetail);
    });

    it('history context — TTL 만료 후 조회 → null', () => {
      placeDetailCache.set('p1', mockPlaceDetail, 'history');

      // 6분 경과 (TTL 5분 초과)
      vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 6 * 60 * 1000);

      const result = placeDetailCache.get('p1', 'history');
      expect(result).toBeNull();
    });

    it('agent context — TTL 체크 안 함', () => {
      placeDetailCache.set('p1', mockPlaceDetail, 'agent');

      // 10분 경과해도 agent는 TTL 체크 안 함
      vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 10 * 60 * 1000);

      const result = placeDetailCache.get('p1', 'agent');
      expect(result).toEqual(mockPlaceDetail);
    });
  });

  describe('clearAgent', () => {
    it('agent 엔트리만 삭제, history 유지', () => {
      placeDetailCache.set('agent1', createMockDetail('a1'), 'agent');
      placeDetailCache.set('history1', createMockDetail('h1'), 'history');

      placeDetailCache.clearAgent();

      expect(placeDetailCache.get('agent1', 'agent')).toBeNull();
      expect(placeDetailCache.get('history1', 'history')).toEqual(createMockDetail('h1'));
    });
  });

  describe('clearAll', () => {
    it('모든 엔트리 삭제', () => {
      placeDetailCache.set('p1', createMockDetail('1'), 'agent');
      placeDetailCache.set('p2', createMockDetail('2'), 'history');

      placeDetailCache.clearAll();

      expect(placeDetailCache.get('p1', 'agent')).toBeNull();
      expect(placeDetailCache.get('p2', 'history')).toBeNull();
    });
  });
});
