/**
 * 홈화면 작동 방식 섹션 컴포넌트
 */

import { useScrollAnimation } from '@/hooks/common/useScrollAnimation';
import { useTranslation } from 'react-i18next';

const STEP_NUMBERS = [1, 2, 3] as const;
const STEP_COLORS = ['bg-brand-primary', 'bg-brand-amber', 'bg-brand-coral'] as const;

export const HomeHowItWorks = () => {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: '100px 0px',
    fallbackTimeout: 2500
  });

  const steps = STEP_NUMBERS.map((num) => ({
    number: num,
    title: t(`home.howItWorks.step${num}.title`),
    description: t(`home.howItWorks.step${num}.description`),
  }));

  return (
    <section ref={ref} className="py-20 px-4 bg-bg-primary">
      <div className="mx-auto max-w-4xl">
        <div
          className={`mb-12 text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-sm uppercase tracking-[0.2em] text-text-secondary font-medium">
            <span className="bg-brand-tertiary text-brand-primary rounded-full px-3 py-1 text-xs font-medium inline-block">
              {t('home.howItWorks.badge')}
            </span>
          </p>
          <h2 className="mt-4 text-4xl font-bold text-text-primary sm:text-5xl">
            {t('home.howItWorks.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
            {t('home.howItWorks.description')}
          </p>
        </div>

        <div className="relative space-y-6">
          {/* Timeline connector line */}
          <div className="absolute left-8 top-8 bottom-8 hidden w-1 bg-gradient-to-b from-brand-primary via-brand-amber to-brand-coral timeline-connector sm:block" />

          {steps.map((step, index) => (
            <StepItem key={step.number} step={step} index={index} stepColor={STEP_COLORS[index]} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface StepItemProps {
  step: {
    number: number;
    title: string;
    description: string;
  };
  index: number;
  stepColor: string;
}

const StepItem = ({ step, index, stepColor }: StepItemProps) => {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: '50px 0px',
    fallbackTimeout: 2500,
    delay: index * 200,
  });

  return (
    <div
      ref={ref}
      className={`flex flex-col gap-6 rounded-[var(--radius-lg)] border border-border-light bg-bg-surface p-6 sm:p-8 shadow-md card-interactive sm:flex-row sm:items-center ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
      }`}
    >
      <div className={`relative z-10 flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full ${stepColor} text-2xl font-bold text-white shadow-lg ring-4 ring-white`}>
        {step.number}
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-text-primary sm:text-2xl">{step.title}</h3>
        <p className="mt-2 text-base text-text-primary">{step.description}</p>
      </div>
    </div>
  );
};
