import { http, HttpResponse } from 'msw';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  LoginResponse,
  RegisterResponse,
  CheckEmailResponse,
  EmailVerificationResponse,
  PasswordResetSendResponse,
  PasswordResetVerifyResponse,
  PasswordResetResponse,
  ReRegisterResponse,
  ReRegisterSocialResponse,
  UpdateUserResponse,
  User,
} from '@/types/auth';

const BASE_URL = 'http://localhost:3000';

// Mock user data
export const mockUser: User = {
  email: 'test@example.com',
  name: 'Test User',
  address: '서울시 강남구 테헤란로 123',
  latitude: 37.5172,
  longitude: 127.0473,
  preferences: {
    likes: ['한식', '중식'],
    dislikes: ['매운 음식'],
    analysis: null,
  },
  role: 'USER',
  createdAt: '2024-01-01T00:00:00.000Z',
};

export const mockLoginResponse: LoginResponse = {
  token: 'mock-jwt-token',
  email: mockUser.email,
  name: mockUser.name,
  address: mockUser.address ?? null,
  latitude: mockUser.latitude ?? null,
  longitude: mockUser.longitude ?? null,
  preferences: mockUser.preferences ?? null,
};

export const authHandlers = [
  // Login
  http.post(`${BASE_URL}${ENDPOINTS.AUTH.LOGIN}`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json(mockLoginResponse);
    }

    if (body.email === 'deleted@example.com') {
      return HttpResponse.json(
        { message: '탈퇴한 계정입니다.', canReRegister: true },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      { message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    );
  }),

  // Register
  http.post(`${BASE_URL}${ENDPOINTS.AUTH.REGISTER}`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string; name?: string };

    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        { message: '이미 등록된 이메일입니다.' },
        { status: 400 }
      );
    }

    const response: RegisterResponse = {
      message: '회원가입이 완료되었습니다.',
    };
    return HttpResponse.json(response, { status: 201 });
  }),

  // Check Email
  http.get(`${BASE_URL}${ENDPOINTS.AUTH.CHECK_EMAIL}`, ({ request }) => {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (email === 'existing@example.com') {
      const response: CheckEmailResponse = {
        available: false,
        message: '이미 등록된 이메일입니다.',
      };
      return HttpResponse.json(response);
    }

    if (email === 'deleted@example.com') {
      const response: CheckEmailResponse = {
        available: false,
        message: '탈퇴한 계정입니다.',
        canReRegister: true,
      };
      return HttpResponse.json(response);
    }

    const response: CheckEmailResponse = {
      available: true,
      message: '사용 가능한 이메일입니다.',
    };
    return HttpResponse.json(response);
  }),

  // Send Email Verification Code
  http.post(`${BASE_URL}${ENDPOINTS.AUTH.EMAIL_SEND_CODE}`, async ({ request }) => {
    const body = (await request.json()) as { email: string; purpose: string };

    if (body.email === 'invalid@example.com') {
      return HttpResponse.json(
        { message: '유효하지 않은 이메일입니다.' },
        { status: 400 }
      );
    }

    const response: EmailVerificationResponse = {
      success: true,
      message: '인증 코드가 발송되었습니다.',
    };
    return HttpResponse.json(response);
  }),

  // Verify Email Code
  http.post(`${BASE_URL}${ENDPOINTS.AUTH.EMAIL_VERIFY_CODE}`, async ({ request }) => {
    const body = (await request.json()) as { email: string; code: string; purpose: string };

    if (body.code === '123456') {
      const response: EmailVerificationResponse = {
        success: true,
        message: '이메일 인증이 완료되었습니다.',
      };
      return HttpResponse.json(response);
    }

    return HttpResponse.json(
      { success: false, message: '인증 코드가 올바르지 않습니다.' },
      { status: 400 }
    );
  }),

  // Password Reset Send Code
  http.post(`${BASE_URL}${ENDPOINTS.AUTH.PASSWORD_RESET_SEND_CODE}`, async ({ request }) => {
    const body = (await request.json()) as { email: string };

    if (body.email === 'notfound@example.com') {
      return HttpResponse.json(
        { message: '등록되지 않은 이메일입니다.' },
        { status: 404 }
      );
    }

    const response: PasswordResetSendResponse = {
      message: '비밀번호 재설정 코드가 발송되었습니다.',
      retryAfter: 60,
      remainCount: 4,
    };
    return HttpResponse.json(response);
  }),

  // Password Reset Verify Code
  http.post(`${BASE_URL}${ENDPOINTS.AUTH.PASSWORD_RESET_VERIFY_CODE}`, async ({ request }) => {
    const body = (await request.json()) as { email: string; code: string };

    if (body.code === '123456') {
      const response: PasswordResetVerifyResponse = {
        success: true,
        message: '코드 인증이 완료되었습니다.',
      };
      return HttpResponse.json(response);
    }

    return HttpResponse.json(
      { success: false, message: '인증 코드가 올바르지 않습니다.' },
      { status: 400 }
    );
  }),

  // Password Reset
  http.post(`${BASE_URL}${ENDPOINTS.AUTH.PASSWORD_RESET}`, async ({ request }) => {
    const body = (await request.json()) as { email: string; newPassword: string };

    if (!body.newPassword || body.newPassword.length < 8) {
      return HttpResponse.json(
        { success: false, message: '비밀번호는 8자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    const response: PasswordResetResponse = {
      success: true,
      message: '비밀번호가 재설정되었습니다.',
    };
    return HttpResponse.json(response);
  }),

  // Re-register
  http.post(`${BASE_URL}${ENDPOINTS.AUTH.RE_REGISTER}`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string; name: string };

    if (body.email !== 'deleted@example.com') {
      return HttpResponse.json(
        { message: '재가입할 수 없는 계정입니다.' },
        { status: 400 }
      );
    }

    const response: ReRegisterResponse = {
      message: '재가입이 완료되었습니다.',
    };
    return HttpResponse.json(response, { status: 201 });
  }),

  // Get current user (ME)
  http.get(`${BASE_URL}${ENDPOINTS.AUTH.ME}`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return HttpResponse.json(mockUser);
  }),

  // Refresh token
  http.post(`${BASE_URL}${ENDPOINTS.AUTH.REFRESH}`, () => {
    return HttpResponse.json({
      token: 'new-access-token',
      refreshToken: 'new-refresh-token',
      user: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      },
    });
  }),

  // Logout
  http.post(`${BASE_URL}${ENDPOINTS.AUTH.LOGOUT}`, () => {
    return HttpResponse.json({ message: '로그아웃되었습니다.' });
  }),

  // Kakao Login
  http.post(`${BASE_URL}${ENDPOINTS.AUTH.KAKAO_LOGIN}`, async ({ request }) => {
    const body = (await request.json()) as { code: string };

    if (body.code === 'invalid-code') {
      return HttpResponse.json(
        { message: '카카오 인증에 실패했습니다.' },
        { status: 400 }
      );
    }

    return HttpResponse.json(mockLoginResponse);
  }),

  // Google Login
  http.post(`${BASE_URL}${ENDPOINTS.AUTH.GOOGLE_LOGIN}`, async ({ request }) => {
    const body = (await request.json()) as { code: string };

    if (body.code === 'invalid-code') {
      return HttpResponse.json(
        { message: '구글 인증에 실패했습니다.' },
        { status: 400 }
      );
    }

    return HttpResponse.json(mockLoginResponse);
  }),

  // Update User
  http.patch(`${BASE_URL}${ENDPOINTS.USER.UPDATE}`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as { name?: string };
    const response: UpdateUserResponse = {
      name: body.name || null,
    };
    return HttpResponse.json(response);
  }),

  // Re-register Social
  http.post(`${BASE_URL}${ENDPOINTS.AUTH.RE_REGISTER_SOCIAL}`, async ({ request }) => {
    const body = (await request.json()) as { email: string };

    if (body.email === 'deleted@example.com') {
      const response: ReRegisterSocialResponse = {
        message: '재가입이 완료되었습니다.',
      };
      return HttpResponse.json(response, { status: 201 });
    }

    return HttpResponse.json(
      { message: '재가입할 수 없는 계정입니다.' },
      { status: 400 }
    );
  }),
];
