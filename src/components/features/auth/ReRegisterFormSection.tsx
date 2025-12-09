/**
 * 재가입 폼 섹션 컴포넌트
 * 이름 입력 및 재가입 버튼을 제공합니다.
 */

import { Button } from '@/components/common/Button';

interface ReRegisterFormSectionProps {
  name: string;
  nameError?: string;
  onNameChange: (name: string) => void;
  onReRegister: () => void;
  isLoading: boolean;
  isEmailVerified: boolean;
  onBackToLogin?: () => void;
}

export const ReRegisterFormSection = ({
  name,
  nameError,
  onNameChange,
  onReRegister,
  isLoading,
  isEmailVerified,
  onBackToLogin,
}: ReRegisterFormSectionProps) => {
  return (
    <>
      {/* 이름 */}
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-200">
          이름
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="이름을 입력하세요"
          className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
        />
        {nameError && <p className="mt-1 text-sm text-red-400">{nameError}</p>}
      </div>

      {/* 재가입 버튼 */}
      <Button
        onClick={onReRegister}
        isLoading={isLoading}
        disabled={!isEmailVerified}
        size="lg"
        className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/30 disabled:opacity-50"
      >
        재가입
      </Button>

      {/* 로그인 링크 */}
      {onBackToLogin && (
        <div className="text-center">
          <button
            onClick={onBackToLogin}
            className="text-sm text-slate-400 hover:text-white transition"
          >
            로그인으로 돌아가기
          </button>
        </div>
      )}
    </>
  );
};

