import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:8080',
    locale: 'ko-KR',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    timeout: 60000,
    actionTimeout: 15000,
    // CSS 애니메이션 비활성화 - 테스트 안정성 향상
    reducedMotion: 'reduce',
  },

  projects: [
    // Desktop browser
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile browser
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  /*
   * Backend + Frontend 서버를 Playwright가 자동으로 띄우고 종료한다.
   *
   * Backend (E2E Mock 모드):
   * - MockExternalModule: 모든 외부 API(Google, Kakao, OpenAI 등) mock 데이터 반환
   * - TestUserSeeder: 시작 시 테스트 유저 자동 생성
   *   - test@example.com / password123
   *   - admin@pickeat.com (관리자)
   *   - kakao-deleted@example.com, google-deleted@example.com (재가입 테스트용)
   * - 인증 코드는 항상 123456으로 고정
   *
   * 사전 조건:
   * - Postgres 컨테이너 5432, Postgres test 5433, Redis 6379 실행 중
   * - Backend 빌드 완료 (pick-eat_be/dist/main.js 존재) — pnpm run build
   *
   * reuseExistingServer: true → 이미 떠 있는 서버는 재사용 (개발 중 편의)
   * Playwright가 자신이 띄운 서버는 테스트 종료 시 자동 정리
   */
  webServer: [
    {
      // Backend 서버 (test 모드 + E2E_MOCK)
      command: 'cd ../pick-eat_be && PORT=3000 NODE_ENV=test E2E_MOCK=true node dist/main.js',
      url: 'http://localhost:3000/ratings/pending',
      reuseExistingServer: true,
      timeout: 120000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      // Frontend 서버 (Vite test 모드)
      command: 'npm run dev -- --mode test',
      url: 'http://localhost:8080',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
});
