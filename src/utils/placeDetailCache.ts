/**
 * PlaceDetail 인메모리 캐시 관리자
 * Agent 페이지는 세션 기반 캐시, History 페이지는 5분 TTL 적용
 */

import type { PlaceDetail } from '@/types/menu';

export type CacheContext = 'agent' | 'history';

interface CacheEntry {
  data: PlaceDetail;
  timestamp: number;
  context: CacheContext;
}

const HISTORY_TTL_MS = 5 * 60 * 1000; // 5분
const MAX_CACHE_SIZE = 100; // LRU 캐시 최대 크기

class PlaceDetailCacheManager {
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * 캐시에서 PlaceDetail 조회
   * history context의 경우 5분 TTL 체크 후 만료 시 삭제 + null 반환
   */
  get(placeId: string, context: CacheContext): PlaceDetail | null {
    const entry = this.cache.get(placeId);
    if (!entry) return null;

    // history context인 경우 TTL 체크
    if (context === 'history') {
      const now = Date.now();
      const age = now - entry.timestamp;
      if (age > HISTORY_TTL_MS) {
        this.cache.delete(placeId);
        return null;
      }
    }

    // LRU: move to end
    this.cache.delete(placeId);
    this.cache.set(placeId, entry);

    return entry.data;
  }

  /**
   * 캐시에 PlaceDetail 저장
   */
  set(placeId: string, data: PlaceDetail, context: CacheContext): void {
    // LRU: 캐시 크기 제한 - 새 항목 추가 시 가장 오래된 항목 제거
    if (this.cache.size >= MAX_CACHE_SIZE && !this.cache.has(placeId)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(placeId, {
      data,
      timestamp: Date.now(),
      context,
    });
  }

  /**
   * agent context 엔트리만 삭제
   * (Redux action 'agent/resetAiRecommendations' 또는 'agent/clearAgentState' 발생 시 호출)
   */
  clearAgent(): void {
    for (const [placeId, entry] of this.cache.entries()) {
      if (entry.context === 'agent') {
        this.cache.delete(placeId);
      }
    }
  }

  /**
   * 전체 캐시 클리어
   */
  clearAll(): void {
    this.cache.clear();
  }
}

// 싱글톤 export
export const placeDetailCache = new PlaceDetailCacheManager();
