import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES, TIMEOUTS } from '../test-data';

/**
 * 마이페이지 Page Object
 */
export class MyPagePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * 마이페이지로 이동
   */
  async goto(): Promise<void> {
    await this.page.goto(ROUTES.MYPAGE);
  }

  // ============================================
  // 주소 관리
  // ============================================

  /**
   * 주소 관리 모달 열기
   */
  async openAddressManagement(): Promise<void> {
    const manageButton = this.page.getByRole('button', { name: '주소 관리' });
    await manageButton.waitFor({ state: 'visible' });
    await manageButton.click();
    await expect(this.page.getByRole('heading', { name: '주소 관리' })).toBeVisible();
  }

  /**
   * 주소 추가 모달 열기
   */
  async openAddressAddModal(): Promise<void> {
    const addAddressButton = this.page.locator('[data-testid="address-list-add-button"]');
    await addAddressButton.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
    await addAddressButton.click();
    await expect(this.page.getByRole('heading', { name: '주소 추가' })).toBeVisible();
  }

  /**
   * 주소 검색
   */
  async searchAddress(query: string): Promise<void> {
    const searchInput = this.page.getByPlaceholder('주소를 검색하세요');
    await expect(searchInput).toBeVisible();
    await searchInput.fill(query);

    const searchButton = this.page.getByRole('button', { name: '검색' });
    await searchButton.waitFor({ state: 'visible' });
    await searchButton.click();
  }

  /**
   * 검색 결과에서 첫 번째 주소 선택
   */
  async selectFirstAddress(): Promise<void> {
    const resultContainer = this.page.locator('[data-testid="address-search-results"]');
    await resultContainer.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });

    const firstResult = resultContainer.locator('button').first();
    await firstResult.waitFor({ state: 'visible' });
    await firstResult.click();

    await expect(this.page.getByText('선택한 주소')).toBeVisible();
  }

  /**
   * 주소 별칭 입력
   */
  async setAddressAlias(alias: string): Promise<void> {
    const aliasInput = this.page.getByPlaceholder(/별칭 입력/);
    await expect(aliasInput).toBeVisible();
    await aliasInput.fill(alias);
  }

  /**
   * 주소 추가 제출
   */
  async submitNewAddress(): Promise<void> {
    const submitButton = this.page.locator('[data-testid="address-add-submit"]');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    await expect(this.page.getByRole('heading', { name: '주소 추가' })).not.toBeVisible({ timeout: TIMEOUTS.MEDIUM });
  }

  /**
   * 주소 관리 모달 닫기
   */
  async closeAddressListModal(): Promise<void> {
    const closeButton = this.page.getByRole('button', { name: '닫기' });
    await closeButton.click();
    await expect(this.page.getByRole('heading', { name: '주소 관리' })).not.toBeVisible();
  }

  // ============================================
  // 취향 관리
  // ============================================

  /**
   * 취향 수정 모달 열기
   */
  async openPreferences(): Promise<void> {
    const preferencesButton = this.page.getByRole('button', { name: '취향 수정' });
    await preferencesButton.click();
    await expect(this.page.getByRole('heading', { name: '취향 수정' })).toBeVisible();
  }

  /**
   * 좋아하는 음식 추가
   */
  async addLikedFood(food: string): Promise<void> {
    const likesInput = this.page.getByPlaceholder('좋아하는 음식이나 재료를 입력하세요');
    await expect(likesInput).toBeVisible();
    await likesInput.fill(food);
    const addButton = this.page.getByRole('button', { name: '추가' }).first();
    await addButton.click();
  }

  /**
   * 취향 정보 저장
   */
  async savePreferences(): Promise<void> {
    const saveButton = this.page.getByRole('button', { name: '취향 정보 저장' });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
  }

  // ============================================
  // 계정 액션
  // ============================================

  /**
   * 로그아웃 버튼 클릭
   */
  async clickLogout(): Promise<void> {
    const logoutButton = this.page.getByRole('button', { name: '로그아웃' });
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();
    await this.page.waitForURL(ROUTES.LOGIN);
  }

  /**
   * 회원 탈퇴 모달 열기
   */
  async clickWithdraw(): Promise<void> {
    const deleteAccountButton = this.page.getByRole('button', { name: '회원 탈퇴' });
    await expect(deleteAccountButton).toBeVisible();
    await deleteAccountButton.click();
    await expect(this.page.getByRole('heading', { name: '회원 탈퇴', level: 2 })).toBeVisible();
  }

  /**
   * 회원 탈퇴 확인
   */
  async confirmWithdraw(): Promise<void> {
    const confirmButton = this.page.getByRole('button', { name: '탈퇴하기' });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
    await this.page.waitForURL(ROUTES.LOGIN, { timeout: TIMEOUTS.MEDIUM });
  }

  // ============================================
  // 검증 메서드
  // ============================================

  /**
   * 마이페이지가 로드되었는지 확인
   */
  async expectPageLoaded(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: '마이페이지' })).toBeVisible();
  }

  /**
   * 주소 관리 모달이 표시되는지 확인
   */
  async expectAddressManagementModalVisible(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: '주소 관리' })).toBeVisible();
  }

  /**
   * 로그아웃 성공 확인
   */
  async expectLogoutSuccess(): Promise<void> {
    await this.expectUrl(ROUTES.LOGIN);
    const accessToken = await this.page.evaluate(() => localStorage.getItem('accessToken'));
    expect(accessToken).toBeNull();
  }
}
