/**
 * 주소 E2E 테스트
 * 주소 검색 → 자동완성 결과 표시 → 주소 선택 → 별칭 입력 → 저장 → 목록 반영 플로우
 *
 * 사전 조건: 백엔드 E2E_MOCK=true 모드로 실행
 * - MockAddressSearchClient: 검색어에 대해 고정 주소 목록 반환
 * - TestUserSeeder: 테스트 사용자 미리 생성 완료
 */

import { test, expect } from './fixtures/auth.fixture';
import { MyPagePage } from './fixtures/page-objects/MyPagePage';

test.describe('주소 관리', () => {
  test('주소 검색 → 자동완성 결과 표시 → 선택 → 별칭 입력 → 저장 → 목록 반영', async ({
    authenticatedPage,
  }) => {
    const myPage = new MyPagePage(authenticatedPage);
    const newAlias = '테스트 장소';

    // ── 1단계: 마이페이지 → 주소 관리 모달 열기 ──────────────────────
    await myPage.goto();
    await myPage.expectPageLoaded();
    await myPage.openAddressManagement();
    await myPage.expectAddressManagementModalVisible();

    // ── 2단계: 주소 추가 모달 열기 ───────────────────────────────────
    await myPage.openAddressAddModal();

    // ── 3단계: 주소 검색 → 자동완성 결과 표시 ────────────────────────
    await myPage.searchAddress('서울');

    // 검색 결과가 화면에 표시되는지 확인
    const searchResults = authenticatedPage.locator('[data-testid="address-search-results"]');
    await expect(searchResults).toBeVisible();
    await expect(searchResults.locator('button').first()).toBeVisible();

    // ── 4단계: 첫 번째 결과 선택 ─────────────────────────────────────
    await myPage.selectFirstAddress();

    // 선택한 주소 미리보기가 표시되는지 확인
    await expect(authenticatedPage.getByText('선택한 주소')).toBeVisible();

    // ── 5단계: 별칭 입력 ─────────────────────────────────────────────
    await myPage.setAddressAlias(newAlias);

    // ── 6단계: 저장 → 모달 닫힘 확인 ────────────────────────────────
    await myPage.submitNewAddress();

    // ── 7단계: 주소 목록에 새 주소(별칭) 반영 확인 ───────────────────
    // submitNewAddress()는 주소 추가 모달이 닫힐 때까지 대기
    // 주소 관리 모달이 다시 보여야 하며, 새로 추가된 별칭이 목록에 있어야 함
    await expect(authenticatedPage.getByText(newAlias)).toBeVisible();
  });

  test('검색 결과 없는 주소 검색 → 빈 결과 메시지 표시', async ({ authenticatedPage }) => {
    const myPage = new MyPagePage(authenticatedPage);

    // 마이페이지 → 주소 관리 → 주소 추가 모달 열기
    await myPage.goto();
    await myPage.expectPageLoaded();
    await myPage.openAddressManagement();
    await myPage.expectAddressManagementModalVisible();
    await myPage.openAddressAddModal();

    // 존재하지 않는 주소 검색
    await myPage.searchAddress('zzzznotexist12345');

    // 검색 결과 컨테이너가 표시되지 않고, 빈 결과 메시지가 표시됨
    const searchResults = authenticatedPage.locator('[data-testid="address-search-results"]');
    await expect(searchResults).not.toBeVisible();
    await expect(authenticatedPage.getByText('주소를 찾을 수 없습니다')).toBeVisible();
  });
});
