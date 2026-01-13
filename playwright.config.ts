import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 3,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    timeout: 60000,
    actionTimeout: 15000,
    // CSS 애니메이션 비활성화 - 테스트 안정성 향상
    reducedMotion: 'reduce',
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile browser
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  /*
   * Backend E2E Mock mode provides:
   * - MockExternalModule: All external APIs (Google, Kakao, Naver, OpenAI) return mock data
   * - TestUserSeeder: Auto-creates test users with addresses on startup
   * - OAuth test codes: test-valid-code, test-no-name-code, test-deleted-user-code, invalid-code
   *
   * 서버가 이미 실행 중인 경우 SKIP_WEBSERVER=true 환경변수로 webServer 설정을 건너뛸 수 있음
   */
  webServer: process.env.SKIP_WEBSERVER === 'true' ? undefined : {
    // 프론트엔드 서버 (test 모드로 실행하여 .env.test 사용)
    command: 'npm run dev -- --mode test',
    url: 'http://localhost:8080',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
