/**
 * 주소 관리 E2E 테스트.
 *
 * 시나리오: docs/testing/scenarios/address.md - Frontend E2E 섹션.
 *
 * 시드된 일반 유저는 기본 주소 1개를 가지고 있으므로, 이 테스트는
 * 추가 주소를 등록한 뒤 편집 모드에서 선택 삭제하여 원복한다. 유니크 별칭으로
 * 다른 spec과의 간섭을 피한다.
 */

import { test, expect } from './fixtures/auth.fixture';
import { ROUTES } from './fixtures/test-data';
import { expectToast, generateUniqueId } from './fixtures/test-helpers';

test.describe('주소 관리', () => {
  test('주소 검색 → 자동완성 결과 → 선택 → 별칭 입력 → 저장 → 목록 반영', async ({
    authedPage: page,
  }) => {
    // 별칭 input은 maxLength=20 이므로 20자 이내로 유지한다.
    const alias = `e2e-${generateUniqueId()}`.slice(0, 20);

    // E2E_MOCK 모드에서 GOOGLE_API_KEY가 없어 BE 주소 검색이 빈 배열을 반환하므로,
    // 네트워크 레벨에서 /user/address/search 응답을 스텁한다. (FE E2E 한정 우회)
    const mockLat = '37.5665';
    const mockLng = '126.9780';
    const mockRoadAddress = `서울특별시 테스트구 테스트로 ${Math.floor(Math.random() * 1000)}`;
    await page.route('**/user/address/search**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          meta: { total_count: 1, pageable_count: 1, is_end: true },
          addresses: [
            {
              address: mockRoadAddress,
              roadAddress: mockRoadAddress,
              postalCode: null,
              latitude: mockLat,
              longitude: mockLng,
            },
          ],
        }),
      });
    });

    // 이전 실행의 잔존 비기본 주소를 API로 선정리한다. (테스트 멱등성 확보)
    const bearer = await page.evaluate(() => localStorage.getItem('token') || '');
    const authHeader = `Bearer ${bearer}`;
    const listRes = await page.request.get('http://localhost:3000/user/addresses', {
      headers: { Authorization: authHeader },
    });
    if (listRes.ok()) {
      const body = (await listRes.json()) as {
        addresses: Array<{ id: number; isDefault: boolean }>;
      };
      const deletable = body.addresses.filter((a) => !a.isDefault).map((a) => a.id);
      if (deletable.length > 0) {
        await page.request.post(
          'http://localhost:3000/user/addresses/batch-delete',
          {
            headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
            data: { ids: deletable },
          }
        );
      }
    }

    await page.goto(ROUTES.MYPAGE_ADDRESS);

    // 온보딩 모달이 떠 있으면 닫는다 (로그인 직후 1회성으로 노출될 수 있음)
    const onboardingSkip = page.getByRole('dialog').getByRole('button', { name: '건너뛰기' }).first();
    if (await onboardingSkip.isVisible().catch(() => false)) {
      await onboardingSkip.click();
    }

    await expect(
      page.getByRole('heading', { name: '주소 관리' })
    ).toBeVisible();

    // 주소 추가 모달 열기
    await page.getByTestId('address-page-add-button').click();

    const dialog = page.getByRole('dialog', { name: '주소 추가' });
    await expect(dialog).toBeVisible();

    // 주소 검색
    await dialog.getByLabel('주소 검색').fill('서울시청');
    await dialog.getByRole('button', { name: '검색' }).click();

    // 자동완성 결과 목록이 노출될 때까지 대기 후 첫 항목 선택
    const results = dialog.getByTestId('address-search-results');
    await expect(results).toBeVisible({ timeout: 10000 });
    await results.locator('button').first().click();

    // 선택된 주소 블록이 표시되고 별칭 입력
    const selected = dialog.getByTestId('selected-address');
    await expect(selected).toBeVisible();
    await selected.getByPlaceholder(/별칭/).fill(alias);

    // 저장
    await dialog.getByTestId('address-add-submit').click();

    // 성공 토스트 + 모달 닫힘
    await expectToast(page, '주소가 추가되었습니다');
    await expect(dialog).toBeHidden();

    // 목록에 새 주소 반영 확인 (별칭으로 식별)
    await expect(page.getByText(alias)).toBeVisible();

    // Cleanup: 편집 모드에서 방금 추가한 비기본 주소를 선택 삭제
    await page.getByRole('button', { name: '편집' }).click();
    const addedCard = page.locator('.cursor-pointer', { hasText: alias }).first();
    await addedCard.getByRole('checkbox').click();
    await page.getByRole('button', { name: /선택한 1개 주소 삭제/ }).click();
    await page
      .getByRole('alertdialog', { name: '주소 삭제' })
      .getByRole('button', { name: '확인' })
      .click();

    await expect(page.getByText(alias)).toBeHidden();
  });
});
