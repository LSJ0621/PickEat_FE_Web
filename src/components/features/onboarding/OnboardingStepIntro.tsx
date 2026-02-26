/**
 * OnboardingStepIntro 컴포넌트
 * 온보딩 Step 1: 서비스 소개 환영 화면
 */

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';

interface OnboardingStepIntroProps {
  onNext: () => void;
  onSkip: () => void;
}

export function OnboardingStepIntro({ onNext, onSkip }: OnboardingStepIntroProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center text-center px-2 py-6">
      {/* Gradient hero area */}
      <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-500 shadow-xl shadow-orange-500/30">
        <span className="text-6xl" role="img" aria-label="fork and knife">
          🍽️
        </span>
      </div>

      {/* Text content */}
      <h2 className="mb-3 text-2xl font-bold text-text-primary">
        {t('onboarding.step1.title')}
      </h2>
      <p className="mb-2 text-base font-medium text-orange-400">
        {t('onboarding.step1.subtitle')}
      </p>
      <p className="mb-10 text-sm leading-relaxed text-text-secondary max-w-xs">
        {t('onboarding.step1.description')}
      </p>

      {/* Actions */}
      <div className="flex w-full flex-col gap-3">
        <Button
          size="lg"
          onClick={onNext}
          className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/30 hover:shadow-orange-500/50"
        >
          {t('onboarding.next')}
        </Button>
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-text-tertiary transition-colors hover:text-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          {t('onboarding.skip')}
        </button>
      </div>
    </div>
  );
}
