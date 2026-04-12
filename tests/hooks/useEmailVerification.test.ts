/**
 * useEmailVerification 테스트
 * 이메일 중복 확인, 인증 코드 발송/검증, 상태 초기화 동작 검증
 */

import { renderHook, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@tests/mocks/server';
import { useEmailVerification } from '@features/auth/hooks/useEmailVerification';

describe('useEmailVerification', () => {
  // API 응답이 인터벌 발화 전에 검증되도록 fake timer 사용
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe('handleCheckEmail', () => {
    it('사용 가능한 이메일 → emailAvailable true', async () => {
      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('newuser@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      expect(result.current.emailAvailable).toBe(true);
      expect(result.current.emailChecked).toBe(true);
    });

    it('이미 존재하는 이메일 → emailAvailable false', async () => {
      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('existing@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      expect(result.current.emailAvailable).toBe(false);
      expect(result.current.emailChecked).toBe(true);
    });
  });

  describe('handleSendVerificationCode', () => {
    it('발송 성공 → isCodeSent true + 타이머 시작', async () => {
      const { result } = renderHook(() => useEmailVerification());

      // SIGNUP 모드: 이메일 중복 확인 먼저
      act(() => {
        result.current.setEmail('newuser@example.com');
      });
      await act(async () => {
        await result.current.handleCheckEmail();
      });

      // 인증 코드 발송
      await act(async () => {
        await result.current.handleSendVerificationCode();
      });

      expect(result.current.isCodeSent).toBe(true);
      expect(result.current.verificationRemaining).toBeGreaterThan(0);
    });
  });

  describe('handleVerifyCode', () => {
    /**
     * 코드 발송까지 완료된 상태로 설정하는 헬퍼
     */
    async function setupWithSentCode() {
      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('newuser@example.com');
      });
      await act(async () => {
        await result.current.handleCheckEmail();
      });
      await act(async () => {
        await result.current.handleSendVerificationCode();
      });

      return result;
    }

    it('올바른 코드 → isEmailVerified true', async () => {
      const result = await setupWithSentCode();

      act(() => {
        result.current.setVerificationCode('123456');
      });

      await act(async () => {
        await result.current.handleVerifyCode();
      });

      expect(result.current.isEmailVerified).toBe(true);
      expect(result.current.verificationMessageVariant).toBe('success');
    });

    it('잘못된 코드 → 에러 메시지 표시', async () => {
      const result = await setupWithSentCode();

      act(() => {
        result.current.setVerificationCode('000000');
      });

      await act(async () => {
        await result.current.handleVerifyCode();
      });

      expect(result.current.isEmailVerified).toBe(false);
      expect(result.current.verificationMessageVariant).toBe('error');
      expect(result.current.verificationMessage).not.toBeNull();
    });
  });

  it('resetEmailVerification — 모든 상태 초기화', async () => {
    const { result } = renderHook(() => useEmailVerification());

    // 이메일 확인 + 코드 발송까지 진행
    act(() => {
      result.current.setEmail('newuser@example.com');
    });
    await act(async () => {
      await result.current.handleCheckEmail();
    });
    await act(async () => {
      await result.current.handleSendVerificationCode();
    });

    // 상태가 변경되었는지 확인 후 초기화
    expect(result.current.isCodeSent).toBe(true);

    act(() => {
      result.current.resetEmailVerification();
    });

    expect(result.current.email).toBe('');
    expect(result.current.verificationCode).toBe('');
    expect(result.current.emailChecked).toBe(false);
    expect(result.current.emailAvailable).toBeNull();
    expect(result.current.isCodeSent).toBe(false);
    expect(result.current.isEmailVerified).toBe(false);
    expect(result.current.verificationRemaining).toBe(0);
    expect(result.current.verificationMessage).toBeNull();
    expect(result.current.verificationMessageVariant).toBeNull();
    expect(result.current.emailError).toBeUndefined();
  });

  it('RE_REGISTER 모드에서 중복확인 스킵 동작', async () => {
    const { result } = renderHook(() =>
      useEmailVerification({ verificationType: 'RE_REGISTER' })
    );

    // RE_REGISTER 모드: emailChecked/emailAvailable 없이 바로 발송
    act(() => {
      result.current.setEmail('test@example.com');
    });

    expect(result.current.emailChecked).toBe(false);
    expect(result.current.emailAvailable).toBeNull();

    await act(async () => {
      await result.current.handleSendVerificationCode();
    });

    expect(result.current.isCodeSent).toBe(true);
    expect(result.current.verificationRemaining).toBeGreaterThan(0);
  });

  describe('에러 시나리오', () => {
    it('이메일 중복확인 API 실패 시 emailError 설정', async () => {
      const BASE_URL = 'http://localhost:3000';
      server.use(
        http.get(`${BASE_URL}/auth/check-email`, () => {
          return HttpResponse.json(
            { message: '서버 오류가 발생했습니다.' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      expect(result.current.emailAvailable).toBeNull();
      expect(result.current.emailError).toBeDefined();
    });

    it('인증코드 발송 API 실패 시 에러 메시지 표시', async () => {
      const BASE_URL = 'http://localhost:3000';
      server.use(
        http.post(`${BASE_URL}/auth/email/send-code`, () => {
          return HttpResponse.json(
            { message: '인증 코드 발송에 실패했습니다.' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useEmailVerification());

      // 먼저 이메일 중복 확인 통과
      act(() => {
        result.current.setEmail('newuser@example.com');
      });
      await act(async () => {
        await result.current.handleCheckEmail();
      });

      // 인증코드 발송 시도 — 서버 에러
      await act(async () => {
        await result.current.handleSendVerificationCode();
      });

      expect(result.current.isCodeSent).toBe(false);
      expect(result.current.verificationMessageVariant).toBe('error');
      expect(result.current.verificationMessage).not.toBeNull();
    });
  });
});
