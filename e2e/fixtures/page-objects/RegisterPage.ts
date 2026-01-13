import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { SELECTORS, ROUTES } from '../test-data';

/**
 * 회원가입 페이지 Page Object
 */
export class RegisterPage extends BasePage {
  private selectors = SELECTORS.register;

  constructor(page: Page) {
    super(page);
  }

  /**
   * 회원가입 페이지로 이동
   */
  async goto(): Promise<void> {
    await this.page.goto(ROUTES.REGISTER);
  }

  /**
   * 이름 입력
   */
  async fillName(name: string): Promise<void> {
    await this.page.fill(this.selectors.name, name);
  }

  /**
   * 이메일 입력
   */
  async fillEmail(email: string): Promise<void> {
    await this.page.fill(this.selectors.email, email);
  }

  /**
   * 이메일 중복 확인 버튼 클릭
   */
  async clickCheckDuplicate(): Promise<void> {
    await this.page.click(this.selectors.checkDuplicateButton);
  }

  /**
   * 인증번호 발송 버튼 클릭
   */
  async clickSendCode(): Promise<void> {
    await this.page.click(this.selectors.sendCodeButton);
  }

  /**
   * 인증코드 입력
   * 6자리 숫자 코드를 각 입력 필드에 순서대로 입력
   */
  async fillVerificationCode(code: string): Promise<void> {
    const inputs = this.page.locator(this.selectors.codeInput);
    for (let i = 0; i < code.length; i++) {
      await inputs.nth(i).fill(code[i]);
    }
  }

  /**
   * 인증 확인 버튼 클릭
   */
  async clickVerifyCode(): Promise<void> {
    await this.page.click(this.selectors.verifyCodeButton);
  }

  /**
   * 비밀번호 입력
   */
  async fillPassword(password: string): Promise<void> {
    await this.page.fill(this.selectors.password, password);
  }

  /**
   * 비밀번호 확인 입력
   */
  async fillConfirmPassword(password: string): Promise<void> {
    await this.page.fill(this.selectors.confirmPassword, password);
  }

  /**
   * 회원가입 버튼 클릭
   */
  async clickRegister(): Promise<void> {
    await this.page.click(this.selectors.submitButton);
  }

  /**
   * 이메일 중복 확인 수행
   */
  async checkEmailDuplicate(email: string): Promise<void> {
    await this.fillEmail(email);
    await this.clickCheckDuplicate();
  }

  /**
   * 사용 가능한 이메일 메시지 확인
   */
  async expectAvailableEmail(): Promise<void> {
    await expect(this.page.locator(this.selectors.availableEmailMessage)).toBeVisible();
  }

  /**
   * 중복된 이메일 메시지 확인
   */
  async expectDuplicateEmail(): Promise<void> {
    await expect(this.page.locator(this.selectors.duplicateEmailMessage)).toBeVisible();
  }

  /**
   * 이메일 인증 완료 메시지 확인
   */
  async expectEmailVerified(): Promise<void> {
    await expect(this.page.locator(this.selectors.emailVerifiedMessage)).toBeVisible();
  }

  /**
   * 재가입 모달 표시 확인
   */
  async expectReRegisterModal(): Promise<void> {
    await expect(this.page.locator(this.selectors.reRegisterModal)).toBeVisible();
  }

  /**
   * 재가입 버튼 클릭
   */
  async clickReRegister(): Promise<void> {
    await this.page.click(this.selectors.reRegisterButton);
  }

  /**
   * 회원가입 버튼 활성화 상태 확인
   */
  async expectRegisterButtonEnabled(): Promise<void> {
    await expect(this.page.locator(this.selectors.submitButton)).toBeEnabled();
  }

  /**
   * 회원가입 버튼 비활성화 상태 확인
   */
  async expectRegisterButtonDisabled(): Promise<void> {
    await expect(this.page.locator(this.selectors.submitButton)).toBeDisabled();
  }

  /**
   * 회원가입 성공 확인 (로그인 페이지로 이동)
   */
  async expectRegistrationSuccess(): Promise<void> {
    await this.page.waitForURL(ROUTES.LOGIN);
  }

  /**
   * 인증번호 입력 필드 표시 확인
   */
  async expectCodeInputVisible(): Promise<void> {
    await expect(this.page.locator(this.selectors.codeInput).first()).toBeVisible();
  }

  /**
   * 재확인 버튼 표시 확인 (중복 확인 후)
   */
  async expectRecheckButtonVisible(): Promise<void> {
    await expect(this.page.locator(this.selectors.recheckButton)).toBeVisible();
  }

  /**
   * 전체 회원가입 플로우 수행
   */
  async performFullRegistration(
    name: string,
    email: string,
    password: string,
    verificationCode: string
  ): Promise<void> {
    // 1. 이름 입력
    await this.fillName(name);

    // 2. 이메일 중복 확인
    await this.checkEmailDuplicate(email);
    await this.expectAvailableEmail();

    // 3. 인증번호 발송
    await this.clickSendCode();
    await this.expectCodeInputVisible();

    // 4. 인증코드 입력 및 확인
    await this.fillVerificationCode(verificationCode);
    await this.clickVerifyCode();
    await this.expectEmailVerified();

    // 5. 비밀번호 입력
    await this.fillPassword(password);
    await this.fillConfirmPassword(password);

    // 6. 회원가입 버튼 활성화 확인 및 클릭
    await this.expectRegisterButtonEnabled();
    await this.clickRegister();

    // 7. 성공 확인
    await this.expectRegistrationSuccess();
  }
}
