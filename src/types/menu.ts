/**
 * 메뉴 관련 타입 정의
 */

export interface MenuRecommendationRequest {
  prompt: string;
}

export interface MenuRecommendationResponse {
  recommendations: string[];
  recommendedAt: string;
}

