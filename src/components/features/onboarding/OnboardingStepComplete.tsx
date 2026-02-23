/**
 * OnboardingStepComplete 컴포넌트
 * 온보딩 Step 5: 완료 화면
 */

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';

interface OnboardingStepCompleteProps {
  onComplete: () => void;
  onPrev: () => void;
}

export function OnboardingStepComplete({ onComplete, onPrev }: OnboardingStepCompleteProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center text-center px-2 py-6">
      {/* Celebration icon */}
      <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-500 shadow-xl shadow-orange-500/30">
        <span className="text-6xl" role="img" aria-label="celebration">
          🎉
        </span>
      </div>

      {/* Text content */}
      <h2 className="mb-3 text-2xl font-bold text-text-primary">
        {t('onboarding.step5.title')}
      </h2>
      <p className="mb-2 text-base font-medium text-orange-400">
        {t('onboarding.step5.subtitle')}
      </p>
      <p className="mb-10 text-sm leading-relaxed text-text-secondary max-w-xs">
        {t('onboarding.step5.description')}
      </p>

      {/* Actions */}
      <div className="flex w-full flex-col gap-3">
        <Button
          size="lg"
          onClick={onComplete}
          className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/30 hover:shadow-orange-500/50"
        >
          {t('onboarding.getStarted')}
        </Button>
        <button
          type="button"
          onClick={onPrev}
          className="text-sm text-text-tertiary transition-colors hover:text-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          {t('onboarding.prev')}
        </button>
      </div>
    </div>
  );
}
