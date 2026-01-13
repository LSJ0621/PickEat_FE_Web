import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { SELECTORS, ROUTES } from '../test-data';

/**
 * 로그인 페이지 Page Object
 */
export class LoginPage extends BasePage {
  private selectors = SELECTORS.login;

  constructor(page: Page) {
    super(page);
  }

  /**
   * 로그인 페이지로 이동
   */
  async goto(): Promise<void> {
    await this.page.goto(ROUTES.LOGIN);
  }

  /**
   * 이메일 입력
   */
  async fillEmail(email: string): Promise<void> {
    await this.page.fill(this.selectors.email, email);
  }

  /**
   * 비밀번호 입력
   */
  async fillPassword(password: string): Promise<void> {
    await this.page.fill(this.selectors.password, password);
  }

  /**
   * 로그인 버튼 클릭
   */
  async clickLoginButton(): Promise<void> {
    await this.page.click(this.selectors.submitButton);
  }

  /**
   * 로그인 수행 (이메일, 비밀번호 입력 후 버튼 클릭)
   */
  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginButton();
  }

  /**
   * Enter 키로 로그인 제출
   */
  async loginWithEnter(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.page.press(this.selectors.password, 'Enter');
  }

  /**
   * 카카오 로그인 버튼 클릭
   */
  async clickKakaoLogin(): Promise<void> {
    await this.page.click(this.selectors.kakaoButton);
  }

  /**
   * 구글 로그인 버튼 클릭
   */
  async clickGoogleLogin(): Promise<void> {
    await this.page.click(this.selectors.googleButton);
  }

  /**
   * 회원가입 링크 클릭
   */
  async goToRegister(): Promise<void> {
    await this.page.click(this.selectors.registerLink);
  }

  /**
   * 비밀번호 재설정 링크 클릭
   */
  async goToForgotPassword(): Promise<void> {
    await this.page.click(this.selectors.forgotPasswordLink);
  }

  /**
   * 에러 메시지 표시 확인
   */
  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.page.locator(`text=${message}`)).toBeVisible();
  }

  /**
   * 로그인 에러 팝업 확인
   */
  async expectLoginErrorPopup(): Promise<void> {
    await expect(this.page.locator(this.selectors.errorPopup)).toBeVisible();
  }

  /**
   * 에러 팝업 닫기
   */
  async closeErrorPopup(): Promise<void> {
    await this.page.click(this.selectors.confirmButton);
  }

  /**
   * 로그인 성공 확인
   */
  async expectLoginSuccess(): Promise<void> {
    await this.page.waitForURL(ROUTES.HOME);
    await this.expectTokenExists();
  }

  /**
   * 로그인 버튼 활성화 상태 확인
   */
  async expectLoginButtonEnabled(): Promise<void> {
    await expect(this.page.locator(this.selectors.submitButton)).toBeEnabled();
  }

  /**
   * 로그인 버튼 비활성화 상태 확인
   */
  async expectLoginButtonDisabled(): Promise<void> {
    await expect(this.page.locator(this.selectors.submitButton)).toBeDisabled();
  }

  /**
   * 카카오 인증 페이지로 이동 확인
   */
  async expectKakaoAuthPage(): Promise<void> {
    await this.page.waitForURL(/kauth\.kakao\.com/);
  }

  /**
   * 구글 인증 페이지로 이동 확인
   */
  async expectGoogleAuthPage(): Promise<void> {
    await this.page.waitForURL(/accounts\.google\.com/);
  }
}
