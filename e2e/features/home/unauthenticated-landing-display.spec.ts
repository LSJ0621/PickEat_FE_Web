// spec: e2e-test-plan/phase-04-home.plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { ROUTES } from '../../fixtures/test-data';

test.describe('Unauthenticated User Landing Page', () => {
  test('Display landing page with all sections for unauthenticated user', async ({ page }) => {
    // 1. Navigate to http://localhost:8080/
    await page.goto(ROUTES.HOME);

    // 3. Verify the page title is 'pickeat_web'
    await expect(page).toHaveTitle('pickeat_web');

    // 4. Verify the header contains the PickEat logo button
    await expect(page.getByRole('button', { name: 'P PickEat Recommendation OS' })).toBeVisible();

    // 5. Verify the header contains a '로그인' button
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();

    // 6. Verify the hero section is visible with heading '오늘 뭐 먹지? AI 에이전트에게 맡기세요'
    await expect(page.getByRole('heading', { name: '오늘 뭐 먹지? AI 에이전트에게 맡기세요' })).toBeVisible();

    // 7. Verify the hero section contains 'PickEat OS' badge text
    await expect(page.getByText('PickEat OS')).toBeVisible();

    // 8. Verify the hero section description contains 'PickEat은 메뉴 추천과 가게 탐색 과정을 자동화하는 AI 기반 추천 OS입니다'
    await expect(page.getByText('PickEat은 메뉴 추천과 가게 탐색 과정을 자동화하는 AI 기반 추천 OS입니다')).toBeVisible();

    // 9. Verify the hero section has two CTA buttons: '로그인하고 시작하기' and '에이전트 화면 미리보기'
    await expect(page.getByRole('button', { name: '로그인하고 시작하기' })).toBeVisible();
    await expect(page.getByRole('button', { name: '에이전트 화면 미리보기' })).toBeVisible();

    // 10. Scroll down to view the features section
    const featuresSection = page.getByRole('heading', { name: '핵심 기능' });
    await featuresSection.scrollIntoViewIfNeeded();

    // 11. Verify the 'Features' section heading '핵심 기능' is visible
    await expect(featuresSection).toBeVisible();

    // 12. Verify three feature cards are displayed: 'AI 메뉴 추천', '메뉴별 가게 탐색', '히스토리 관리'
    await expect(page.getByRole('heading', { name: 'AI 메뉴 추천' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '메뉴별 가게 탐색' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '히스토리 관리' })).toBeVisible();

    // 13. Verify each feature card has an emoji icon, title, and description
    await expect(page.getByText('🤖')).toBeVisible();
    await expect(page.getByText('🗺️').first()).toBeVisible();
    await expect(page.getByText('📋')).toBeVisible();

    // 14. Scroll down to view the how-it-works section
    const howItWorksSection = page.getByRole('heading', { name: 'AI 추천 플로우' });
    await howItWorksSection.scrollIntoViewIfNeeded();

    // 15. Verify the 'How it works' section heading 'AI 추천 플로우' is visible
    await expect(howItWorksSection).toBeVisible();

    // 16. Verify three step cards are displayed with numbers 1, 2, 3
    await expect(page.getByText('1', { exact: true })).toBeVisible();
    await expect(page.getByText('2', { exact: true })).toBeVisible();
    await expect(page.getByText('3', { exact: true })).toBeVisible();

    // 17. Verify step 1 contains 'AI에게 오늘의 기분이나 상황을 알려주세요'
    await expect(page.getByRole('heading', { name: 'AI에게 오늘의 기분이나 상황을 알려주세요.' })).toBeVisible();

    // 18. Verify step 2 contains '추천된 메뉴 중 마음에 드는 항목을 선택하세요'
    await expect(page.getByRole('heading', { name: '추천된 메뉴 중 마음에 드는 항목을 선택하세요.' })).toBeVisible();

    // 19. Verify step 3 contains '메뉴별 AI 가게 추천으로 바로 근처 식당을 확인하세요'
    await expect(page.getByRole('heading', { name: '메뉴별 AI 가게 추천으로 바로 근처 식당을 확인하세요.' })).toBeVisible();

    // 20. Scroll down to view the highlights section
    const highlightsSection = page.getByRole('heading', { name: '주요 기능 하이라이트' });
    await highlightsSection.scrollIntoViewIfNeeded();

    // 21. Verify the 'Highlights' section heading '주요 기능 하이라이트' is visible
    await expect(highlightsSection).toBeVisible();

    // 22. Verify three highlight cards are displayed: 'AI 추천 기능', '지도 기반 검색', '개인화된 추천'
    await expect(page.getByRole('heading', { name: 'AI 추천 기능' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '지도 기반 검색' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '개인화된 추천' })).toBeVisible();

    // 23. Scroll down to view the final CTA section
    const ctaSection = page.getByRole('heading', { name: '지금 바로 PickEat을 시작해보세요' });
    await ctaSection.scrollIntoViewIfNeeded();

    // 24. Verify the final CTA section heading '지금 바로 PickEat을 시작해보세요' is visible
    await expect(ctaSection).toBeVisible();

    // 25. Verify the final CTA section has two buttons: '이메일로 로그인' and '에이전트 미리보기'
    await expect(page.getByRole('button', { name: '이메일로 로그인' })).toBeVisible();
    await expect(page.getByRole('button', { name: '에이전트 미리보기' })).toBeVisible();

    // 26. Verify the footer navigation bar is visible with 5 buttons
    await expect(page.getByRole('button', { name: '홈', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '에이전트', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '추천 이력', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '버그 제보', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '마이페이지', exact: true })).toBeVisible();
  });
});
