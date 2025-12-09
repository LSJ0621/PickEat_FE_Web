/**
 * 이메일 인증 섹션 컴포넌트
 * 이메일 입력, 중복 확인, 인증번호 발송 및 검증 UI를 제공합니다.
 */

import { Button } from '@/components/common/Button';
import type { UseEmailVerificationReturn } from '@/hooks/useEmailVerification';

interface EmailVerificationSectionProps {
  emailVerification: UseEmailVerificationReturn;
  emailError?: string;
  verificationCodeError?: string;
  onEmailChange?: (email: string) => void;
  onVerificationCodeChange?: (code: string) => void;
}

export const EmailVerificationSection = ({
  emailVerification,
  emailError,
  verificationCodeError,
  onEmailChange,
  onVerificationCodeChange,
}: EmailVerificationSectionProps) => {
  // 이메일 변경 핸들러 (외부 상태와 동기화)
  const handleEmailChange = (newEmail: string) => {
    emailVerification.setEmail(newEmail);
    if (onEmailChange) {
      onEmailChange(newEmail);
    }
  };

  // 인증 코드 변경 핸들러 (외부 상태와 동기화)
  const handleVerificationCodeChange = (code: string) => {
    emailVerification.setVerificationCode(code);
    if (onVerificationCodeChange) {
      onVerificationCodeChange(code);
    }
  };

  const isVerifyButtonDisabled =
    emailVerification.verifyCodeLoading ||
    !emailVerification.isCodeSent ||
    emailVerification.isEmailVerified ||
    !emailVerification.verificationCode.trim();

  const verifyButtonClass = isVerifyButtonDisabled
    ? 'rounded-2xl bg-slate-800/80 px-4 py-3 text-sm font-semibold text-slate-500 cursor-not-allowed transition'
    : 'rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/30 hover:brightness-110 transition';

  return (
    <>
      {/* 이메일 입력 */}
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
          이메일
        </label>
        <div className="flex gap-2">
          <input
            id="email"
            type="email"
            value={emailVerification.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="이메일을 입력하세요"
            className={`flex-1 rounded-2xl border ${
              emailError || emailVerification.emailError
                ? 'border-red-500/60'
                : emailVerification.emailAvailable === true
                ? 'border-green-400'
                : 'border-white/15'
            } bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60`}
          />
          <button
            onClick={emailVerification.handleEmailAction}
            disabled={emailVerification.isEmailActionDisabled()}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              emailVerification.emailChecked && emailVerification.emailAvailable === true
                ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-md shadow-pink-500/30 hover:brightness-110 disabled:opacity-60 disabled:brightness-100'
                : 'border border-white/15 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50'
            }`}
          >
            {emailVerification.getEmailActionLabel()}
          </button>
        </div>
        {(emailError || emailVerification.emailError) && (
          <p className="mt-1 text-sm text-red-400">{emailError || emailVerification.emailError}</p>
        )}
        {emailVerification.emailAvailable === true && (
          <p className="mt-1 text-sm text-green-400">사용 가능한 이메일입니다.</p>
        )}
      </div>

      {/* 이메일 인증 */}
      <div>
        {emailVerification.isCodeSent && !emailVerification.isEmailVerified && (
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>메일을 받지 못하셨나요?</span>
            <button
              type="button"
              onClick={emailVerification.handleSendVerificationCode}
              className="font-medium text-pink-300 underline decoration-2 decoration-pink-400/50 underline-offset-4 transition hover:text-pink-100 hover:decoration-pink-300 hover:decoration-2"
            >
              재발송 받기
            </button>
          </div>
        )}
        <div className="text-sm font-medium text-slate-200">이메일 인증</div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={emailVerification.verificationCode}
            onChange={(e) => handleVerificationCodeChange(e.target.value)}
            placeholder="6자리 인증번호 입력"
            disabled={!emailVerification.isCodeSent || emailVerification.isEmailVerified}
            className={`flex-1 min-w-0 rounded-2xl border ${
              verificationCodeError || emailVerification.emailError
                ? 'border-red-500/60'
                : emailVerification.isEmailVerified
                ? 'border-green-400'
                : 'border-white/15'
            } bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60 disabled:opacity-60`}
          />
          <Button
            onClick={emailVerification.handleVerifyCode}
            isLoading={emailVerification.verifyCodeLoading}
            disabled={isVerifyButtonDisabled}
            size="sm"
            className={verifyButtonClass}
          >
            확인
          </Button>
        </div>
        {emailVerification.verificationMessage && (
          <p
            className={`mt-2 text-sm ${
              emailVerification.verificationMessageVariant === 'error'
                ? 'text-red-400'
                : 'text-green-400'
            }`}
          >
            {emailVerification.verificationMessage}
          </p>
        )}
        {verificationCodeError && (
          <p className="mt-2 text-sm text-red-400">{verificationCodeError}</p>
        )}
      </div>
    </>
  );
};

