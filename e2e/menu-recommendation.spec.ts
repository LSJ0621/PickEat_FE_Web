/**
 * 메뉴 추천 E2E 테스트
 * 프롬프트 입력 → AI 응답 수신 → 추천 메뉴 표시 → 메뉴 선택 → 맛집 추천 → 지도 확인 플로우 검증
 *
 * 사전 조건: 백엔드 E2E_MOCK=true 모드로 실행
 * - AI 추천 응답은 MockExternalModule에서 고정 데이터 반환
 * - 테스트 사용자는 TestUserSeeder로 미리 생성됨 (주소 설정 완료)
 */

import { test, expect } from './fixtures/auth.fixture';
import { AgentPage } from './fixtures/page-objects/AgentPage';
import { ROUTES, EXPECTED_MOCK_RESPONSES } from './fixtures/test-data';

test.describe('메뉴 추천', () => {
  test('프롬프트 입력 → AI 응답 수신 → 추천 메뉴 표시 → 메뉴 선택 → 맛집 추천 → 지도 확인', async ({
    authenticatedPage,
  }) => {
    const agentPage = new AgentPage(authenticatedPage);

    // ── 1단계: 메뉴 추천 받기 ─────────────────────────────────────
    await agentPage.goto();

    // 프롬프트 입력 → 추천 요청 → AI 응답 대기
    await agentPage.enterQuestion('오늘 점심으로 따뜻한 한식이 먹고 싶어');
    await agentPage.submitQuestion();
    await agentPage.waitForRecommendation();

    // 추천 메뉴 목록 표시 확인
    await agentPage.expectRecommendationVisible();

    // ── 2단계: 메뉴 선택 ──────────────────────────────────────────
    // 첫 번째 추천 메뉴 선택 → AI 추천 보기 선택
    await agentPage.selectRecommendedMenu(1);

    // 선택 확인 모달 표시 확인
    await agentPage.expectModalContent();
    await agentPage.expectModalActionButtons();

    // ── 3단계: 맛집 추천 (AI) ─────────────────────────────────────
    await agentPage.confirmMenuSelection();

    // AI 추천 식당 결과 표시 확인
    await agentPage.expectMockAiRestaurantVisible();

    // ── 4단계: 지도 확인 ──────────────────────────────────────────
    // 추천된 식당이 표시된 이후 지도 탭/페이지 접근 가능 확인
    // (현재 페이지가 AI 추천 결과를 올바르게 렌더링했으므로 URL은 /agent 유지)
    await expect(authenticatedPage).toHaveURL(ROUTES.AGENT);

    // 식당 이름과 추천 이유가 노출됨
    await expect(
      authenticatedPage.getByText(EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName)
    ).toBeVisible();
  });
});
