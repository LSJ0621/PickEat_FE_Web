/**
 * 홈화면 작동 방식 섹션 컴포넌트
 */

import { useScrollAnimation } from '@/hooks/common/useScrollAnimation';
import { useTranslation } from 'react-i18next';

const STEP_NUMBERS = [1, 2, 3] as const;

export const HomeHowItWorks = () => {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2, delay: 100 });

  const steps = STEP_NUMBERS.map((num) => ({
    number: num,
    title: t(`home.howItWorks.step${num}.title`),
    description: t(`home.howItWorks.step${num}.description`),
  }));

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="mx-auto max-w-4xl">
        <div
          className={`mb-12 text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-sm uppercase tracking-[0.4em] text-orange-200/80">{t('home.howItWorks.badge')}</p>
          <h2 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
            {t('home.howItWorks.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            {t('home.howItWorks.description')}
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <StepItem key={step.number} step={step} index={index} />
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
}

const StepItem = ({ step, index }: StepItemProps) => {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.2,
    delay: index * 200,
  });

  return (
    <div
      ref={ref}
      className={`flex flex-col gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-900/40 p-8 shadow-2xl backdrop-blur transition-all duration-700 sm:flex-row sm:items-center ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
      }`}
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/30 to-rose-500/30 text-2xl font-bold text-orange-200 shadow-lg">
        {step.number}
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-white sm:text-2xl">{step.title}</h3>
        <p className="mt-2 text-base text-slate-300">{step.description}</p>
      </div>
    </div>
  );
};
