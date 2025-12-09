/**
 * 비밀번호 입력 섹션 컴포넌트
 * 비밀번호 및 비밀번호 확인 입력 UI를 제공합니다.
 */

import { isValidPassword, isPasswordMatch } from '@/utils/validation';
import { ERROR_MESSAGES, VALIDATION } from '@/utils/constants';

interface PasswordInputSectionProps {
  password: string;
  confirmPassword: string;
  passwordError?: string;
  confirmPasswordError?: string;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const PasswordInputSection = ({
  password,
  confirmPassword,
  passwordError,
  confirmPasswordError,
  onPasswordChange,
  onConfirmPasswordChange,
  onKeyPress,
}: PasswordInputSectionProps) => {
  return (
    <>
      {/* 비밀번호 입력 */}
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder={`비밀번호를 입력하세요 (최소 ${VALIDATION.PASSWORD_MIN_LENGTH}자)`}
          className={`w-full rounded-2xl border ${
            passwordError ? 'border-red-500/60' : 'border-white/15'
          } bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60`}
        />
        {passwordError && <p className="mt-1 text-sm text-red-400">{passwordError}</p>}
        {password && !isValidPassword(password) && (
          <p className="mt-1 text-sm text-slate-400">
            비밀번호는 최소 {VALIDATION.PASSWORD_MIN_LENGTH}자 이상이어야 합니다.
          </p>
        )}
      </div>

      {/* 비밀번호 확인 */}
      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-200">
          비밀번호 확인
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          placeholder="비밀번호를 다시 입력하세요"
          className={`w-full rounded-2xl border ${
            confirmPasswordError ? 'border-red-500/60' : 'border-white/15'
          } bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60`}
          onKeyPress={onKeyPress}
        />
        {confirmPasswordError && (
          <p className="mt-1 text-sm text-red-400">{confirmPasswordError}</p>
        )}
        {confirmPassword && !isPasswordMatch(password, confirmPassword) && (
          <p className="mt-1 text-sm text-red-400">{ERROR_MESSAGES.PASSWORD_MISMATCH}</p>
        )}
      </div>
    </>
  );
};

