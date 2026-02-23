/**
 * OnboardingStepHowItWorks 컴포넌트
 * 온보딩 Step 3: 사용 방법 안내
 */

import { useTranslation } from 'react-i18next';

interface OnboardingStepHowItWorksProps {
  onNext: () => void;
  onPrev: () => void;
}

const STEPS = [
  {
    number: '1',
    titleKey: 'onboarding.step3.step1Title',
    descKey: 'onboarding.step3.step1Desc',
    gradientClasses: 'from-orange-500 to-amber-500',
  },
  {
    number: '2',
    titleKey: 'onboarding.step3.step2Title',
    descKey: 'onboarding.step3.step2Desc',
    gradientClasses: 'from-rose-500 to-pink-500',
  },
  {
    number: '3',
    titleKey: 'onboarding.step3.step3Title',
    descKey: 'onboarding.step3.step3Desc',
    gradientClasses: 'from-purple-500 to-violet-500',
  },
] as const;

export function OnboardingStepHowItWorks({ onNext, onPrev }: OnboardingStepHowItWorksProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col px-2 py-4">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-text-primary">
          {t('onboarding.step3.title')}
        </h2>
      </div>

      {/* Steps list with connecting line */}
      <div className="mb-8 relative">
        {/* Vertical connecting line */}
        <div
          className="absolute left-5 top-5 bottom-5 w-px bg-gradient-to-b from-orange-500/50 via-rose-500/50 to-purple-500/50"
          aria-hidden="true"
        />

        <div className="space-y-6">
          {STEPS.map(({ number, titleKey, descKey, gradientClasses }) => (
            <div key={number} className="flex items-start gap-4 relative">
              {/* Number badge */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradientClasses} text-sm font-bold text-white shadow-md z-10`}
                aria-hidden="true"
              >
                {number}
              </div>
              {/* Content */}
              <div className="pt-1.5">
                <p className="mb-1 text-sm font-semibold text-text-primary">
                  {t(titleKey)}
                </p>
                <p className="text-xs leading-relaxed text-text-secondary">
                  {t(descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 rounded-xl border border-border-default bg-transparent py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          {t('onboarding.prev')}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition-all hover:shadow-orange-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        >
          {t('onboarding.next')}
        </button>
      </div>
    </div>
  );
}
