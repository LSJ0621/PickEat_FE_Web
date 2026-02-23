/**
 * Place Rating System 관련 타입 정의
 */

export interface PendingRating {
  id: number;
  placeId: string;
  placeName: string;
  createdAt: string;
}

export interface SelectPlaceRequest {
  placeId: string;
  placeName: string;
  placeRecommendationId?: number;
}

export interface SubmitRatingRequest {
  placeRatingId: number;
  rating: number;
}

export interface SkipRatingRequest {
  placeRatingId: number;
}

export interface RatingHistoryItem {
  id: number;
  placeId: string;
  placeName: string;
  rating: number | null;
  skipped: boolean;
  promptDismissed: boolean;
  createdAt: string;
}

export interface RatingHistoryResponse {
  items: RatingHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetRatingHistoryParams {
  page?: number;
  limit?: number;
  selectedDate?: string;
}

export interface DismissRatingRequest {
  placeRatingId: number;
}
