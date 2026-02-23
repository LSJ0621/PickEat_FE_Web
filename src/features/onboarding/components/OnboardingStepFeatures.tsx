/**
 * OnboardingStepFeatures 컴포넌트
 * 온보딩 Step 2: 주요 기능 소개
 */

import { useTranslation } from 'react-i18next';
import { Sparkles, Map, Heart } from 'lucide-react';

interface OnboardingStepFeaturesProps {
  onNext: () => void;
  onPrev: () => void;
}

const FEATURE_CARDS = [
  {
    icon: Sparkles,
    titleKey: 'onboarding.step2.feature1Title',
    descKey: 'onboarding.step2.feature1Desc',
    colorClasses: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
  },
  {
    icon: Map,
    titleKey: 'onboarding.step2.feature2Title',
    descKey: 'onboarding.step2.feature2Desc',
    colorClasses: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
  },
  {
    icon: Heart,
    titleKey: 'onboarding.step2.feature3Title',
    descKey: 'onboarding.step2.feature3Desc',
    colorClasses: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
  },
] as const;

export function OnboardingStepFeatures({ onNext, onPrev }: OnboardingStepFeaturesProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col px-2 py-4">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-text-primary">
          {t('onboarding.step2.title')}
        </h2>
      </div>

      {/* Feature cards */}
      <div className="mb-8 space-y-3">
        {FEATURE_CARDS.map(({ icon: Icon, titleKey, descKey, colorClasses }) => (
          <div
            key={titleKey}
            className={`flex items-start gap-4 rounded-2xl border p-4 ${colorClasses}`}
          >
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-current/10">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
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
