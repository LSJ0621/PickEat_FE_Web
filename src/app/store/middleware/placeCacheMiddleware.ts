/**
 * Place Cache Middleware
 * Redux action 'agent/resetAiRecommendations' 또는 'agent/clearAgentState' 발생 시
 * agent context 캐시 클리어
 */

import type { Middleware } from '@reduxjs/toolkit';
import { placeDetailCache } from '@shared/utils/placeDetailCache';
import { resetAiRecommendations, clearAgentState } from '@app/store/slices/agentSlice';

export const placeCacheMiddleware: Middleware = () => (next) => (action) => {
  // 리듀서 실행 먼저
  const result = next(action);

  // action type이 agent context 캐시 클리어 대상인 경우
  if (
    resetAiRecommendations.match(action) ||
    clearAgentState.match(action)
  ) {
    placeDetailCache.clearAgent();
  }

  return result;
};
