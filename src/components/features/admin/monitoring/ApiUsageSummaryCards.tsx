/**
 * API 사용량 요약 카드 컴포넌트
 * OpenAI, Google Places, Google CSE, Kakao API 통계를 카드로 표시
 */

import { StatCard } from '@/components/features/admin/dashboard/StatCard';
import type { ApiUsageResponse } from '@/types/admin-monitoring';
import { Brain, MapPin, Search, MessageCircle } from 'lucide-react';

interface ApiUsageSummaryCardsProps {
  data: ApiUsageResponse;
}

export function ApiUsageSummaryCards({ data }: ApiUsageSummaryCardsProps) {
  const { openai, googlePlaces, googleCse, kakao } = data;

  // Calculate error rates (100 - successRate)
  const openaiErrorRate = 100 - openai.successRate;
  const placesErrorRate = 100 - googlePlaces.successRate;

  // Calculate Kakao totals from nested stats
  const kakaoTotalCalls = kakao.local.totalCalls + kakao.oauth.totalCalls;
  const kakaoAvgErrorRate = kakaoTotalCalls > 0
    ? ((100 - kakao.local.successRate) * kakao.local.totalCalls + (100 - kakao.oauth.successRate) * kakao.oauth.totalCalls) / kakaoTotalCalls
    : 0;

  // Calculate CSE quota usage percent
  const cseQuotaPercent = googleCse.dailyQuota > 0
    ? (googleCse.todayUsage / googleCse.dailyQuota) * 100
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* OpenAI */}
      <StatCard
        title="OpenAI"
        value={openai.totalCalls.toLocaleString()}
        icon={Brain}
        description={`에러율 ${openaiErrorRate.toFixed(1)}% | $${openai.estimatedCostUsd.toFixed(2)}`}
        variant={openaiErrorRate > 5 ? 'warning' : 'default'}
      />

      {/* Google Places */}
      <StatCard
        title="Google Places"
        value={googlePlaces.totalCalls.toLocaleString()}
        icon={MapPin}
        description={`평균 응답 ${googlePlaces.avgResponseTimeMs}ms`}
        variant={placesErrorRate > 5 ? 'warning' : 'default'}
      />

      {/* Google CSE */}
      <StatCard
        title="Google CSE"
        value={googleCse.totalCalls.toLocaleString()}
        icon={Search}
        description={`할당량 ${cseQuotaPercent.toFixed(1)}% 사용 (${googleCse.todayUsage}/${googleCse.dailyQuota})`}
        variant={cseQuotaPercent > 80 ? 'danger' : cseQuotaPercent > 60 ? 'warning' : 'default'}
      />

      {/* Kakao */}
      <StatCard
        title="Kakao"
        value={kakaoTotalCalls.toLocaleString()}
        icon={MessageCircle}
        description={`지역 ${kakao.local.totalCalls} | 인증 ${kakao.oauth.totalCalls}`}
        variant={kakaoAvgErrorRate > 5 ? 'warning' : 'default'}
      />
    </div>
  );
}
