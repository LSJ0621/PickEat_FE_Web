import { test, expect } from './fixtures/auth.fixture';
import { ROUTES } from './fixtures/test-data';
import { generateUniqueId } from './fixtures/test-helpers';

test.describe('마이페이지 — 취향 수정 → 로그아웃', () => {
  test('Happy Path: 로그인 → 취향 편집 → 저장 → 새로고침 → 로그아웃', async ({ authedPage }) => {
    const page = authedPage;

    // 메인 페이지 도달 확인
    await expect(page).toHaveURL(new RegExp(`${ROUTES.HOME}$`));

    // 마이페이지 진입 (하단 탭바는 모바일 전용 → 데스크탑에서는 직접 navigate)
    await page.goto(ROUTES.MYPAGE);
    await expect(page).toHaveURL(new RegExp(`${ROUTES.MYPAGE}$`));

    // 프로필 Hero 카드 렌더 확인
    await expect(page.getByText('test@example.com').first()).toBeVisible();

    // 취향 섹션 진입
    await page.getByRole('button', { name: '취향', exact: true }).first().click();
    await expect(page).toHaveURL(new RegExp(`${ROUTES.MYPAGE_PREFERENCES}$`));

    // 취향 수정 모달 열기
    await page.getByRole('button', { name: '취향 수정', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 병렬 실행 / 시드 계정 공유 대비 유니크 값 사용
    const likeToken = `like-${generateUniqueId()}`;
    const dislikeToken = `dis-${generateUniqueId()}`;

    // 좋아요 추가
    await dialog.locator('input[placeholder*="좋아하는"]').fill(likeToken);
    await dialog.getByRole('button', { name: '추가', exact: true }).first().click();
    await expect(
      dialog.locator('[data-testid="like-tag"]').filter({ hasText: likeToken })
    ).toBeVisible();

    // 싫어요 추가
    await dialog.locator('input[placeholder*="싫어하는"]').fill(dislikeToken);
    await dialog.getByRole('button', { name: '추가', exact: true }).nth(1).click();
    await expect(
      dialog.locator('[data-testid="dislike-tag"]').filter({ hasText: dislikeToken })
    ).toBeVisible();

    // 저장 → 모달 닫힘
    await dialog.getByRole('button', { name: '취향 정보 저장', exact: true }).click();
    await expect(dialog).toBeHidden({ timeout: 5000 });

    // PreferencesSection 에 반영
    await expect(page.getByText(likeToken).first()).toBeVisible();
    await expect(page.getByText(dislikeToken).first()).toBeVisible();

    // 새로고침 후 유지
    await page.reload();
    await expect(page.getByText(likeToken).first()).toBeVisible();
    await expect(page.getByText(dislikeToken).first()).toBeVisible();

    // 뒤로가기 → /mypage 복귀
    await page.getByRole('button', { name: '뒤로가기' }).click();
    await expect(page).toHaveURL(new RegExp(`${ROUTES.MYPAGE}$`));

    // Cleanup: 추가한 토큰 제거 (다른 spec 오염 방지)
    await page.goto(ROUTES.MYPAGE_PREFERENCES);
    await page.getByRole('button', { name: '취향 수정', exact: true }).click();
    const dialog2 = page.getByRole('dialog');
    await expect(dialog2).toBeVisible();
    const likeRemove = dialog2
      .locator('[data-testid="like-tag"]')
      .filter({ hasText: likeToken })
      .getByRole('button');
    if (await likeRemove.count()) await likeRemove.first().click();
    const disRemove = dialog2
      .locator('[data-testid="dislike-tag"]')
      .filter({ hasText: dislikeToken })
      .getByRole('button');
    if (await disRemove.count()) await disRemove.first().click();
    await dialog2.getByRole('button', { name: '취향 정보 저장', exact: true }).click();
    await expect(dialog2).toBeHidden({ timeout: 5000 });

    // 로그아웃
    await page.goto(ROUTES.MYPAGE);
    await page.getByRole('button', { name: '로그아웃', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${ROUTES.LOGIN}$`), { timeout: 10000 });
  });

  test('Error Case: 취향 저장 API 실패 → 에러 토스트 + 모달 유지', async ({ authedPage }) => {
    const page = authedPage;

    // 저장 API 500 목킹 (POST만 가로챔)
    await page.route('**/user/preferences', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' }),
        });
      }
      return route.fallback();
    });

    await page.goto(ROUTES.MYPAGE_PREFERENCES);
    await page.getByRole('button', { name: '취향 수정', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const likeToken = `errlike-${generateUniqueId()}`;
    await dialog.locator('input[placeholder*="좋아하는"]').fill(likeToken);
    await dialog.getByRole('button', { name: '추가', exact: true }).first().click();
    await expect(
      dialog.locator('[data-testid="like-tag"]').filter({ hasText: likeToken })
    ).toBeVisible();

    await dialog.getByRole('button', { name: '취향 정보 저장', exact: true }).click();

    // 에러 토스트 (role="status")
    await expect(page.getByRole('status').first()).toBeVisible({ timeout: 5000 });

    // 모달 유지
    await expect(dialog).toBeVisible();
    await expect(
      dialog.locator('[data-testid="like-tag"]').filter({ hasText: likeToken })
    ).toBeVisible();
  });
});
