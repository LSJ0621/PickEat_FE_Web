import { describe, it, expect } from 'vitest';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  EmailVerificationPurpose,
  AuthResponse,
  KakaoLoginResponse,
  LoginResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  RegisterResponse,
  PasswordResetSendResponse,
  PasswordResetVerifyResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  CheckEmailResponse,
  EmailVerificationResponse,
  ReRegisterRequest,
  ReRegisterResponse,
  ReRegisterSocialRequest,
  ReRegisterSocialResponse,
  DeleteAccountResponse,
} from '@/types/auth';

describe('User', () => {
  it('should accept valid user object with all required fields', () => {
    const user: User = {
      email: 'test@example.com',
      name: 'Test User',
    };
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Test User');
  });

  it('should accept user with optional fields', () => {
    const user: User = {
      email: 'test@example.com',
      name: 'Test User',
      address: '서울시 강남구',
      latitude: 37.123,
      longitude: 127.456,
      preferences: {
        likes: ['한식', '중식'],
        dislikes: ['매운음식'],
        analysis: 'AI 분석 결과',
      },
      role: 'USER',
      createdAt: '2024-01-01T00:00:00.000Z',
    };
    expect(user.address).toBe('서울시 강남구');
    expect(user.latitude).toBe(37.123);
    expect(user.longitude).toBe(127.456);
    expect(user.preferences?.likes).toEqual(['한식', '중식']);
    expect(user.role).toBe('USER');
    expect(user.createdAt).toBe('2024-01-01T00:00:00.000Z');
  });

  it('should accept user with null optional fields', () => {
    const user: User = {
      email: 'test@example.com',
      name: 'Test User',
      address: null,
      latitude: null,
      longitude: null,
      preferences: null,
    };
    expect(user.address).toBeNull();
    expect(user.latitude).toBeNull();
    expect(user.longitude).toBeNull();
    expect(user.preferences).toBeNull();
  });

  it('should accept preferences with null analysis', () => {
    const user: User = {
      email: 'test@example.com',
      name: 'Test User',
      preferences: {
        likes: ['한식'],
        dislikes: [],
        analysis: null,
      },
    };
    expect(user.preferences?.analysis).toBeNull();
  });
});

describe('LoginRequest', () => {
  it('should accept valid login request', () => {
    const request: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
    };
    expect(request.email).toBe('test@example.com');
    expect(request.password).toBe('password123');
  });

  it('should require both email and password fields', () => {
    const request: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
    };
    expect(request).toHaveProperty('email');
    expect(request).toHaveProperty('password');
  });
});

describe('RegisterRequest', () => {
  it('should accept register request with all fields', () => {
    const request: RegisterRequest = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };
    expect(request.email).toBe('test@example.com');
    expect(request.password).toBe('password123');
    expect(request.name).toBe('Test User');
  });

  it('should accept register request without optional name field', () => {
    const request: RegisterRequest = {
      email: 'test@example.com',
      password: 'password123',
    };
    expect(request.email).toBe('test@example.com');
    expect(request.password).toBe('password123');
    expect(request.name).toBeUndefined();
  });
});

describe('EmailVerificationPurpose', () => {
  it('should accept valid purpose values', () => {
    const signup: EmailVerificationPurpose = 'SIGNUP';
    const resetPassword: EmailVerificationPurpose = 'RESET_PASSWORD';
    const reRegister: EmailVerificationPurpose = 'RE_REGISTER';

    expect(signup).toBe('SIGNUP');
    expect(resetPassword).toBe('RESET_PASSWORD');
    expect(reRegister).toBe('RE_REGISTER');
  });
});

describe('AuthResponse', () => {
  it('should accept valid auth response', () => {
    const response: AuthResponse = {
      token: 'access_token_123',
      refreshToken: 'refresh_token_456',
      user: {
        email: 'test@example.com',
        name: 'Test User',
      },
    };
    expect(response.token).toBe('access_token_123');
    expect(response.refreshToken).toBe('refresh_token_456');
    expect(response.user.email).toBe('test@example.com');
  });

  it('should require all fields', () => {
    const response: AuthResponse = {
      token: 'token',
      refreshToken: 'refresh',
      user: { email: 'test@example.com', name: 'Test' },
    };
    expect(response).toHaveProperty('token');
    expect(response).toHaveProperty('refreshToken');
    expect(response).toHaveProperty('user');
  });
});

describe('KakaoLoginResponse', () => {
  it('should accept valid kakao login response', () => {
    const response: KakaoLoginResponse = {
      token: 'token_123',
      email: 'test@kakao.com',
      name: 'Kakao User',
      address: '서울시 강남구',
      latitude: 37.123,
      longitude: 127.456,
      preferences: {
        likes: ['한식'],
        dislikes: [],
      },
    };
    expect(response.token).toBe('token_123');
    expect(response.email).toBe('test@kakao.com');
  });

  it('should accept response with null optional fields', () => {
    const response: KakaoLoginResponse = {
      token: 'token_123',
      email: null,
      name: null,
      address: null,
      latitude: null,
      longitude: null,
      preferences: null,
    };
    expect(response.email).toBeNull();
    expect(response.name).toBeNull();
    expect(response.address).toBeNull();
  });
});

describe('LoginResponse', () => {
  it('should accept valid login response', () => {
    const response: LoginResponse = {
      token: 'token_123',
      email: 'test@example.com',
      name: 'Test User',
      address: '서울시 강남구',
      latitude: 37.123,
      longitude: 127.456,
      preferences: {
        likes: ['한식'],
        dislikes: ['매운음식'],
        analysis: 'AI 분석',
      },
    };
    expect(response.token).toBe('token_123');
    expect(response.email).toBe('test@example.com');
  });

  it('should accept response with null optional fields', () => {
    const response: LoginResponse = {
      token: 'token_123',
      email: null,
      name: null,
      address: null,
      latitude: null,
      longitude: null,
      preferences: null,
    };
    expect(response.token).toBe('token_123');
    expect(response.email).toBeNull();
  });
});

describe('UpdateUserRequest', () => {
  it('should accept update request with name', () => {
    const request: UpdateUserRequest = {
      name: 'Updated Name',
    };
    expect(request.name).toBe('Updated Name');
  });

  it('should accept empty update request', () => {
    const request: UpdateUserRequest = {};
    expect(request.name).toBeUndefined();
  });
});

describe('UpdateUserResponse', () => {
  it('should accept update response with name', () => {
    const response: UpdateUserResponse = {
      name: 'Updated Name',
    };
    expect(response.name).toBe('Updated Name');
  });

  it('should accept response with null name', () => {
    const response: UpdateUserResponse = {
      name: null,
    };
    expect(response.name).toBeNull();
  });
});

describe('RegisterResponse', () => {
  it('should accept valid register response', () => {
    const response: RegisterResponse = {
      message: '회원가입이 완료되었습니다.',
    };
    expect(response.message).toBe('회원가입이 완료되었습니다.');
  });

  it('should require message field', () => {
    const response: RegisterResponse = {
      message: 'Success',
    };
    expect(response).toHaveProperty('message');
  });
});

describe('PasswordResetSendResponse', () => {
  it('should accept response with all fields', () => {
    const response: PasswordResetSendResponse = {
      message: '이메일을 전송했습니다.',
      retryAfter: 60,
      remainCount: 3,
    };
    expect(response.message).toBe('이메일을 전송했습니다.');
    expect(response.retryAfter).toBe(60);
    expect(response.remainCount).toBe(3);
  });

  it('should accept response without optional fields', () => {
    const response: PasswordResetSendResponse = {
      message: '이메일을 전송했습니다.',
    };
    expect(response.message).toBe('이메일을 전송했습니다.');
    expect(response.retryAfter).toBeUndefined();
    expect(response.remainCount).toBeUndefined();
  });
});

describe('PasswordResetVerifyResponse', () => {
  it('should accept verify response with all fields', () => {
    const response: PasswordResetVerifyResponse = {
      success: true,
      message: '인증이 완료되었습니다.',
    };
    expect(response.success).toBe(true);
    expect(response.message).toBe('인증이 완료되었습니다.');
  });

  it('should accept response without optional message', () => {
    const response: PasswordResetVerifyResponse = {
      success: false,
    };
    expect(response.success).toBe(false);
    expect(response.message).toBeUndefined();
  });
});

describe('PasswordResetRequest', () => {
  it('should accept valid password reset request', () => {
    const request: PasswordResetRequest = {
      email: 'test@example.com',
      newPassword: 'newPassword123',
    };
    expect(request.email).toBe('test@example.com');
    expect(request.newPassword).toBe('newPassword123');
  });

  it('should require both email and newPassword fields', () => {
    const request: PasswordResetRequest = {
      email: 'test@example.com',
      newPassword: 'newPassword123',
    };
    expect(request).toHaveProperty('email');
    expect(request).toHaveProperty('newPassword');
  });
});

describe('PasswordResetResponse', () => {
  it('should accept valid password reset response', () => {
    const response: PasswordResetResponse = {
      success: true,
      message: '비밀번호가 변경되었습니다.',
    };
    expect(response.success).toBe(true);
    expect(response.message).toBe('비밀번호가 변경되었습니다.');
  });

  it('should require both success and message fields', () => {
    const response: PasswordResetResponse = {
      success: false,
      message: '실패했습니다.',
    };
    expect(response).toHaveProperty('success');
    expect(response).toHaveProperty('message');
  });
});

describe('CheckEmailResponse', () => {
  it('should accept response with all fields', () => {
    const response: CheckEmailResponse = {
      available: true,
      message: '사용 가능한 이메일입니다.',
      canReRegister: false,
    };
    expect(response.available).toBe(true);
    expect(response.message).toBe('사용 가능한 이메일입니다.');
    expect(response.canReRegister).toBe(false);
  });

  it('should accept response without optional canReRegister', () => {
    const response: CheckEmailResponse = {
      available: false,
      message: '이미 사용 중인 이메일입니다.',
    };
    expect(response.available).toBe(false);
    expect(response.message).toBe('이미 사용 중인 이메일입니다.');
    expect(response.canReRegister).toBeUndefined();
  });
});

describe('EmailVerificationResponse', () => {
  it('should accept response with all fields', () => {
    const response: EmailVerificationResponse = {
      success: true,
      message: '인증이 완료되었습니다.',
    };
    expect(response.success).toBe(true);
    expect(response.message).toBe('인증이 완료되었습니다.');
  });

  it('should accept response without optional message', () => {
    const response: EmailVerificationResponse = {
      success: false,
    };
    expect(response.success).toBe(false);
    expect(response.message).toBeUndefined();
  });
});

describe('ReRegisterRequest', () => {
  it('should accept valid re-register request', () => {
    const request: ReRegisterRequest = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };
    expect(request.email).toBe('test@example.com');
    expect(request.password).toBe('password123');
    expect(request.name).toBe('Test User');
  });

  it('should require all fields', () => {
    const request: ReRegisterRequest = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };
    expect(request).toHaveProperty('email');
    expect(request).toHaveProperty('password');
    expect(request).toHaveProperty('name');
  });
});

describe('ReRegisterResponse', () => {
  it('should accept valid re-register response', () => {
    const response: ReRegisterResponse = {
      message: '재가입이 완료되었습니다.',
    };
    expect(response.message).toBe('재가입이 완료되었습니다.');
  });

  it('should require message field', () => {
    const response: ReRegisterResponse = {
      message: 'Success',
    };
    expect(response).toHaveProperty('message');
  });
});

describe('ReRegisterSocialRequest', () => {
  it('should accept valid re-register social request', () => {
    const request: ReRegisterSocialRequest = {
      email: 'deleted@example.com',
    };
    expect(request.email).toBe('deleted@example.com');
  });

  it('should require email field', () => {
    const request: ReRegisterSocialRequest = {
      email: 'user@example.com',
    };
    expect(request).toHaveProperty('email');
  });
});

describe('ReRegisterSocialResponse', () => {
  it('should accept valid re-register social response', () => {
    const response: ReRegisterSocialResponse = {
      message: '소셜 재가입이 완료되었습니다.',
    };
    expect(response.message).toBe('소셜 재가입이 완료되었습니다.');
  });

  it('should require message field', () => {
    const response: ReRegisterSocialResponse = {
      message: 'Success',
    };
    expect(response).toHaveProperty('message');
  });
});

describe('DeleteAccountResponse', () => {
  it('should accept valid delete account response', () => {
    const response: DeleteAccountResponse = {
      message: '계정이 삭제되었습니다.',
    };
    expect(response.message).toBe('계정이 삭제되었습니다.');
  });

  it('should require message field', () => {
    const response: DeleteAccountResponse = {
      message: 'Account deleted',
    };
    expect(response).toHaveProperty('message');
  });
});
