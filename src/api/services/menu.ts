/**
 * 메뉴 관련 API 서비스
 */

import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import type { MenuRecommendationResponse } from '@/types/menu';

export const menuService = {
  /**
   * 메뉴 추천 받기
   * @param prompt - 사용자가 입력한 메뉴 추천 요청 텍스트
   */
  recommend: async (prompt: string): Promise<MenuRecommendationResponse> => {
    const response = await apiClient.post<MenuRecommendationResponse>(
      ENDPOINTS.MENU.RECOMMEND,
      { prompt }
    );
    return response.data;
  },
};

