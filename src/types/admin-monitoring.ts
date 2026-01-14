/**
 * 관리자 시스템 모니터링 타입 정의
 * Backend DTO와 동기화됨: pick-eat_be/src/admin/monitoring/dto/api-usage-response.dto.ts
 */

export type MonitoringPeriod = '7d' | '30d' | '90d';

export interface ProviderStats {
  totalCalls: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgResponseTimeMs: number;
}

export interface OpenAiStats extends ProviderStats {
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  byModel: Array<{ model: string; calls: number; tokens: number; estimatedCostUsd: number }>;
  dailyBreakdown: Array<{ date: string; calls: number; tokens: number }>;
}

export interface GooglePlacesStats extends ProviderStats {
  dailyBreakdown: Array<{ date: string; calls: number }>;
}

export interface GoogleCseStats extends ProviderStats {
  dailyQuota: number;
  todayUsage: number;
  remainingQuota: number;
  dailyBreakdown: Array<{ date: string; calls: number }>;
}

export interface KakaoSubStats {
  totalCalls: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgResponseTimeMs: number;
}

export interface KakaoStats {
  local: KakaoSubStats;
  oauth: KakaoSubStats;
  dailyBreakdown: Array<{ date: string; localCalls: number; oauthCalls: number }>;
}

export interface ApiUsageResponse {
  period: string;
  openai: OpenAiStats;
  googlePlaces: GooglePlacesStats;
  googleCse: GoogleCseStats;
  kakao: KakaoStats;
}

/**
 * 이메일 통계 응답
 * Backend DTO와 동기화됨: pick-eat_be/src/admin/monitoring/dto/email-stats-response.dto.ts
 */
export interface EmailStats {
  period: string;
  summary: {
    totalSent: number;
    successCount: number;
    failureCount: number;
    successRate: number;
  };
  byPurpose: Array<{
    purpose: string;
    totalSent: number;
    successCount: number;
    failureCount: number;
    successRate: number;
  }>;
  dailyBreakdown: Array<{
    date: string;
    totalSent: number;
    successCount: number;
    failureCount: number;
  }>;
}

export interface StorageStats {
  totalSizeBytes: number;
  totalSizeMb: number;
  fileCount: number;
  files: Array<{ key: string; size: number; lastModified: string }>;
}
