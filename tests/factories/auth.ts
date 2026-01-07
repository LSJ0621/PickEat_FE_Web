import { vi } from 'vitest';
import type { UseEmailVerificationReturn } from '@/hooks/auth/useEmailVerification';

/**
 * Creates a mock UseEmailVerificationReturn object for testing
 * @param overrides - Partial override values
 * @returns Mock UseEmailVerificationReturn object with all required properties and default vi.fn() implementations
 */
export function createMockEmailVerification(
  overrides?: Partial<UseEmailVerificationReturn>
): UseEmailVerificationReturn {
  return {
    email: '',
    verificationCode: '',
    emailChecked: false,
    emailAvailable: null,
    emailCheckLoading: false,
    sendCodeLoading: false,
    verifyCodeLoading: false,
    isCodeSent: false,
    isEmailVerified: false,
    verificationRemaining: 0,
    verificationMessage: null,
    verificationMessageVariant: null,
    emailError: undefined,
    setEmail: vi.fn(),
    setVerificationCode: vi.fn(),
    handleCheckEmail: vi.fn(),
    handleSendVerificationCode: vi.fn(),
    handleVerifyCode: vi.fn(),
    handleEmailAction: vi.fn(),
    getEmailActionLabel: vi.fn(() => '중복 확인'),
    isEmailActionDisabled: vi.fn(() => false),
    formatSeconds: vi.fn((seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`),
    resetEmailVerification: vi.fn(),
    ...overrides,
  };
}
