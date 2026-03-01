/**
 * PreferencesGuideSection - 취향 설정 페이지 안내 가이드 섹션
 * AI 취향 분석 프로세스를 3단계로 설명하는 독립 컴포넌트
 *
 * Usage:
 * import { PreferencesGuideSection } from '@features/user/components/preferences/PreferencesGuideSection';
 * <PreferencesGuideSection />
 */

import { useTranslation } from 'react-i18next';
import { Sparkles, Heart, Brain, ChefHat } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StepConfig {
  icon: LucideIcon;
  stepNumber: string;
  cardBg: string;
  iconBg: string;
  iconColor: string;
  titleKey: string;
  descKey: string;
}

const STEPS: StepConfig[] = [
  {
    icon: Heart,
    stepNumber: '01',
    cardBg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    titleKey: 'user.preferences.guide.step1Title',
    descKey: 'user.preferences.guide.step1Desc',
  },
  {
    icon: Brain,
    stepNumber: '02',
    cardBg: 'bg-violet-50',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    titleKey: 'user.preferences.guide.step2Title',
    descKey: 'user.preferences.guide.step2Desc',
  },
  {
    icon: ChefHat,
    stepNumber: '03',
    cardBg: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    titleKey: 'user.preferences.guide.step3Title',
    descKey: 'user.preferences.guide.step3Desc',
  },
];

export function PreferencesGuideSection() {
  const { t } = useTranslation();

  return (
    <div className="rounded-[32px] bg-bg-surface shadow-2xl p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100">
          <Sparkles className="h-6 w-6 text-orange-500" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-text-primary leading-snug">
            {t('user.preferences.guide.title')}
          </h2>
          <p className="mt-1 text-sm text-text-secondary leading-relaxed">
            {t('user.preferences.guide.subtitle')}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border-primary mb-6" />

      {/* Step Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.stepNumber}
              className={`rounded-2xl ${step.cardBg} p-5 flex flex-col gap-3`}
            >
              {/* Icon and Step Number */}
              <div className="flex items-center justify-between">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${step.iconBg}`}
                >
                  <Icon
                    className={`h-5 w-5 ${step.iconColor}`}
                    aria-hidden="true"
                  />
                </div>
                <span className="text-xs font-bold text-text-tertiary tracking-widest">
                  {step.stepNumber}
                </span>
              </div>

              {/* Text Content */}
              <div>
                <p className="text-sm font-semibold text-text-primary mb-1">
                  {t(step.titleKey)}
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {t(step.descKey)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
