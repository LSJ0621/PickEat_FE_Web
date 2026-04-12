/**
 * E2E 테스트 공유 상수.
 *
 * 라우트 경로는 `src/app/routes/paths.ts`의 ROUTES와 동일한 값을 사용한다.
 * 시드된 테스트 계정은 백엔드 E2E_MOCK 프로필에서 생성되는 고정 계정이다.
 */

/** E2E 테스트에서 사용할 라우트 경로. `src/app/routes/paths.ts`와 일치시켜야 한다. */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  RE_REGISTER: '/re-register',
  PASSWORD_RESET_REQUEST: '/password/reset/request',
  PASSWORD_RESET: '/password/reset',

  MYPAGE: '/mypage',
  MYPAGE_PROFILE: '/mypage/profile',
  MYPAGE_PREFERENCES: '/mypage/preferences',
  MYPAGE_ADDRESS: '/mypage/address',

  AGENT: '/agent',
  MAP: '/map',
  BUG_REPORT: '/bug-report',

  RECOMMENDATIONS_HISTORY: '/recommendations/history',
  MENU_SELECTIONS_HISTORY: '/menu-selections/history',
  RATINGS_HISTORY: '/ratings/history',
} as const;

/** E2E_MOCK 프로필에서 시드된 고정 테스트 계정. */
export const TEST_ACCOUNTS = {
  REGULAR: {
    email: 'test@example.com',
    password: 'password123',
  },
  ADMIN: {
    email: 'admin@pickeat.com',
    password: 'password123',
  },
} as const;

/** E2E_MOCK 모드에서 이메일 인증코드는 항상 이 값으로 고정된다. */
export const TEST_VERIFICATION_CODE = '123456';
