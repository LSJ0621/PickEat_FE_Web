import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES, SELECTORS } from '../test-data';

/**
 * 비밀번호 재설정 페이지 Page Object
 */
export class PasswordResetPage extends BasePage {
  private selectors = SELECTORS.passwordReset;

  constructor(page: Page) {
    super(page);
  }

  /**
   * 비밀번호 재설정 페이지로 이동
   */
  async goto(): Promise<void> {
    await this.page.goto(ROUTES.FORGOT_PASSWORD);
    await this.page.getByRole('heading', { name: '비밀번호 재설정' }).waitFor({ state: 'visible' });
  }

  /**
   * 이메일 입력
   */
  async fillEmail(email: string): Promise<void> {
    await this.page.getByRole('textbox', { name: '이메일' }).fill(email);
  }

  /**
   * 인증번호 발송 버튼 클릭
   */
  async clickSendCode(): Promise<void> {
    await this.page.getByRole('button', { name: '인증번호 발송' }).click();
  }

  /**
   * 인증번호 입력
   */
  async fillVerificationCode(code: string): Promise<void> {
    await this.page.getByRole('textbox', { name: '인증번호' }).fill(code);
  }

  /**
   * 인증하기 버튼 클릭
   */
  async clickVerifyCode(): Promise<void> {
    await this.page.getByRole('button', { name: '인증하기' }).click();
  }

  /**
   * 새 비밀번호 입력
   */
  async fillNewPassword(password: string): Promise<void> {
    await this.page.locator(this.selectors.reset.newPassword).fill(password);
  }

  /**
   * 비밀번호 확인 입력
   */
  async fillConfirmPassword(password: string): Promise<void> {
    await this.page.locator(this.selectors.reset.confirmPassword).fill(password);
  }

  /**
   * 비밀번호 변경 버튼 클릭
   */
  async submitReset(): Promise<void> {
    await this.page.getByRole('button', { name: '비밀번호 변경' }).click();
  }

  /**
   * 인증번호 발송 완료 확인
   */
  async expectCodeSent(): Promise<void> {
    await expect(this.page.getByRole('textbox', { name: '인증번호' })).toBeVisible();
  }

  /**
   * 비밀번호 재설정 성공 확인
   */
  async expectResetSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(ROUTES.LOGIN, { timeout: 10000 });
  }

  /**
   * 모든 UI 요소 표시 확인
   */
  async expectAllElementsVisible(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: '비밀번호 재설정' })).toBeVisible();
    await expect(this.page.getByRole('textbox', { name: '이메일' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: '인증번호 발송' })).toBeVisible();
  }

  /**
   * 로그인 페이지로 이동
   */
  async goToLogin(): Promise<void> {
    await this.page.getByRole('button', { name: '로그인 화면으로 돌아가기' }).click();
  }
}
