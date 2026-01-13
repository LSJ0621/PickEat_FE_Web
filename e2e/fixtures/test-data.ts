/**
 * E2E 테스트용 상수 및 데이터 정의
 */

/**
 * 테스트 계정 정보
 *
 * ⚠️ 보안 경고: 이 파일은 E2E 테스트 전용입니다.
 * - 프로덕션 환경에서 절대 사용하지 마세요
 * - 실제 사용자 비밀번호를 여기에 저장하지 마세요
 * - 백엔드 E2E_MOCK=true 모드에서만 동작합니다
 */
export const TEST_ACCOUNTS = {
  USER: {
    email: 'test@example.com',
    password: 'password123',
    name: '테스트유저',
  },
  ADMIN: {
    email: 'admin@example.com',
    password: 'adminpassword',
    name: '관리자',
  },
  NEW_USER: {
    email: `test-${Date.now()}@example.com`,
    password: 'newpassword123',
    name: '신규유저',
  },
  DELETED_USER: {
    email: 'deleted@example.com',
  },
} as const;

// 테스트 인증 코드
export const TEST_VERIFICATION = {
  CODE: '123456', // 백엔드 테스트 모드 고정 코드
  INVALID_CODE: '000000',
} as const;

// OAuth 테스트 코드
export const OAUTH_TEST_CODES = {
  VALID: 'test-valid-code',
  NO_NAME: 'test-no-name-code',
  DELETED_USER: 'test-deleted-user-code',
  INVALID: 'invalid-code',
} as const;

// 라우트 경로
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/password/reset/request',
  PASSWORD_RESET: '/password/reset',
  AGENT: '/agent',
  MAP: '/map',
  MYPAGE: '/mypage',
  RECOMMENDATIONS_HISTORY: '/recommendations/history',
  MENU_SELECTIONS_HISTORY: '/menu-selections/history',
  BUG_REPORT: '/bug-report',
  ADMIN_BUG_REPORTS: '/admin/bug-reports',
  OAUTH_KAKAO_REDIRECT: '/oauth/kakao/redirect',
  OAUTH_GOOGLE_REDIRECT: '/oauth/google/redirect',
} as const;

// 보호된 라우트 목록
export const PROTECTED_ROUTES = [
  ROUTES.AGENT,
  ROUTES.MAP,
  ROUTES.MYPAGE,
  ROUTES.RECOMMENDATIONS_HISTORY,
  ROUTES.MENU_SELECTIONS_HISTORY,
  ROUTES.BUG_REPORT,
] as const;

// 관리자 전용 라우트
export const ADMIN_ROUTES = [ROUTES.ADMIN_BUG_REPORTS] as const;

// 셀렉터
export const SELECTORS = {
  // 공통
  common: {
    loadingSpinner: '[data-testid="loading-spinner"]',
    toast: '[role="alert"]',
    dialog: '[role="dialog"]',
    dialogCloseButton: '[aria-label="Close"]',
  },

  // 로그인 페이지
  login: {
    email: '#email',
    password: '#password',
    submitButton: 'button:has-text("로그인")',
    kakaoButton: 'button:has-text("카카오로 계속하기")',
    googleButton: 'button:has-text("Google로 계속하기")',
    registerLink: 'button:has-text("회원가입")',
    forgotPasswordLink: 'button:has-text("재설정하기")',
    errorPopup: 'text=로그인에 실패했습니다',
    confirmButton: 'button:has-text("확인")',
  },

  // 회원가입 페이지
  register: {
    name: '#name',
    email: '#email',
    checkDuplicateButton: 'button:has-text("중복 확인")',
    recheckButton: 'button:has-text("재확인")',
    sendCodeButton: 'button:has-text("인증번호 발송")',
    codeInput: 'input[inputmode="numeric"]',
    verifyCodeButton: 'button:has-text("확인")',
    password: '#password',
    confirmPassword: '#confirmPassword',
    submitButton: 'button:has-text("회원가입")',
    availableEmailMessage: 'text=사용 가능한 이메일입니다',
    duplicateEmailMessage: 'text=이미 사용 중인 이메일입니다',
    emailVerifiedMessage: 'text=이메일 인증이 완료되었습니다',
    reRegisterModal: 'text=재가입 안내',
    reRegisterButton: 'button:has-text("재가입하기")',
  },

  // 비밀번호 재설정 페이지
  passwordReset: {
    request: {
      email: '#reset-email',
      sendCodeButton: 'button:has-text("인증번호 발송")',
      waitingButton: 'button:has-text("대기")',
      resendButton: 'button:has-text("재발송")',
      codeInput: '#reset-code',
      verifyButton: 'button:has-text("인증하기")',
    },
    reset: {
      newPassword: '#new-password',
      confirmPassword: '#confirm-password',
      submitButton: 'button:has-text("비밀번호 변경")',
      noEmailError: 'text=이메일을 찾지 못했어요',
    },
  },

  // OAuth 콜백 페이지
  oauth: {
    kakao: {
      loadingText: 'text=카카오 로그인 진행 중',
      nameInputForm: 'text=이름을 입력해주세요',
      nameInput: '#name',
      completeButton: 'button:has-text("완료")',
    },
    google: {
      loadingText: 'text=구글 로그인 진행 중',
    },
    common: {
      reRegisterModal: 'text=재가입 안내',
      reRegisterButton: 'button:has-text("재가입")',
      cancelButton: 'button:has-text("취소")',
      errorMessage: 'text=로그인에 실패했습니다',
      noCodeError: 'text=인증 코드를 받지 못했습니다',
      backToLoginButton: 'button:has-text("로그인 페이지로 돌아가기")',
    },
  },

  // 마이페이지
  mypage: {
    userName: '[data-testid="user-name"]',
    userEmail: '[data-testid="user-email"]',
    addressList: '.address-list',
    addAddressButton: 'button:has-text("주소 추가")',
    logoutButton: 'button:has-text("로그아웃")',
    deleteAccountButton: 'button:has-text("회원 탈퇴")',
  },

  // 버그 리포트
  bugReport: {
    category: '#category',
    title: '#title',
    description: '#description',
    submitButton: 'button:has-text("제출")',
    successMessage: 'text=제출되었습니다',
  },

  // 관리자 버그 리포트
  adminBugReports: {
    list: '.bug-report-list',
    row: '.bug-report-row',
    statusFilter: '#status-filter',
    detailButton: 'button:has-text("상세")',
    statusChangeButton: 'button:has-text("상태 변경")',
    newStatusSelect: '#new-status',
    changeButton: 'button:has-text("변경")',
    successMessage: 'text=상태가 변경되었습니다',
  },
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  LOGIN_FAILED: '로그인에 실패했습니다',
  NAME_REQUIRED: '이름을 입력해주세요.',
  EMAIL_REQUIRED: '이메일을 입력해주세요.',
  INVALID_EMAIL: '올바른 이메일 형식이 아닙니다.',
  EMAIL_DUPLICATE_CHECK_REQUIRED: '이메일 중복 확인을 해주세요.',
  EMAIL_VERIFICATION_REQUIRED: '이메일 인증을 완료해주세요.',
  PASSWORD_TOO_SHORT: '비밀번호는 6자 이상이어야 합니다.',
  PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다.',
} as const;

// 테스트 타임아웃 설정
export const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 30000, // AI 추천 등 오래 걸리는 작업
  COOLDOWN: 35000, // 쿨다운 타이머 대기
} as const;

/**
 * 백엔드 Mock 응답과 일치하는 예상 데이터
 * 백엔드 E2E_MOCK=true 모드에서 반환되는 데이터와 동기화
 *
 * 참조: pick-eat_be/src/external/mocks/fixtures/index.ts
 */
export const EXPECTED_MOCK_RESPONSES = {
  // TwoStageMenuService Mock 응답
  MENU_RECOMMENDATION: {
    recommendations: ['김치찌개', '된장찌개', '순두부찌개'],
    reason: '추운 날씨에 딱 맞는 따뜻한 국물 요리입니다.',
  },

  // OpenAiPlacesService Mock 응답
  AI_PLACES: {
    firstRestaurantName: '맛있는 한식당',
    firstRestaurantReason: '리뷰가 좋고 위치가 편리합니다.',
  },

  // MockNaverSearchClient 응답
  NAVER_SEARCH: {
    firstRestaurantName: '맛있는 한식당',
    firstRestaurantAddress: '서울특별시 강남구 테헤란로 123',
  },

  // 테스트 유저 주소 정보
  USER_ADDRESS: {
    roadAddress: '서울특별시 강남구 테헤란로 123',
    latitude: 37.4979,
    longitude: 127.0276,
  },
} as const;
