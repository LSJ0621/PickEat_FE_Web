/**
 * OnboardingModal 컴포넌트
 * 5단계 온보딩 플로우를 담는 메인 모달 컨테이너
 *
 * Usage:
 *   <OnboardingModal
 *     isOpen={isOnboardingOpen}
 *     currentStep={currentStep}
 *     totalSteps={totalSteps}
 *     onNext={nextStep}
 *     onPrev={prevStep}
 *     onComplete={completeOnboarding}
 *     onSkip={skipOnboarding}
 *   />
 */

import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { useModalAnimation } from '@shared/hooks/useModalAnimation';
import { useModalScrollLock } from '@shared/hooks/useModalScrollLock';
import { useFocusTrap } from '@shared/hooks/useFocusTrap';
import { useEscapeKey } from '@shared/hooks/useEscapeKey';
import { Z_INDEX } from '@shared/utils/constants';
import { OnboardingStepIntro } from './OnboardingStepIntro';
import { OnboardingStepFeatures } from './OnboardingStepFeatures';
import { OnboardingStepHowItWorks } from './OnboardingStepHowItWorks';
import { OnboardingStepSetup } from './OnboardingStepSetup';
import { OnboardingStepComplete } from './OnboardingStepComplete';

interface OnboardingModalProps {
  isOpen: boolean;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onComplete: () => void;
  onSkip: () => void;
}

const STEP_VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

const STEP_TRANSITION = {
  duration: 0.25,
  ease: 'easeInOut' as const,
};

export function OnboardingModal({
  isOpen,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onComplete,
  onSkip,
}: OnboardingModalProps) {
  const { t } = useTranslation();
  const { isAnimating, shouldRender } = useModalAnimation(isOpen);
  useModalScrollLock(isOpen);
  const focusTrapRef = useFocusTrap(isOpen);

  useEscapeKey(onSkip, isOpen);

  // 스텝 전환 방향 추적: 앞으로 +1, 뒤로 -1 (애니메이션 방향 결정)
  const prevStepRef = useRef(currentStep);
  const directionRef = useRef(1);
  if (currentStep !== prevStepRef.current) {
    directionRef.current = currentStep > prevStepRef.current ? 1 : -1;
    prevStepRef.current = currentStep;
  }

  if (!shouldRender) return null;

  const direction = directionRef.current;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <OnboardingStepIntro onNext={onNext} onSkip={onSkip} />;
      case 1:
        return <OnboardingStepFeatures onNext={onNext} onPrev={onPrev} />;
      case 2:
        return <OnboardingStepHowItWorks onNext={onNext} onPrev={onPrev} />;
      case 3:
        return <OnboardingStepSetup onNext={onNext} onPrev={onPrev} />;
      case 4:
        return <OnboardingStepComplete onComplete={onComplete} onPrev={onPrev} />;
      default:
        return null;
    }
  };

  return createPortal(
    <div
      className={`fixed inset-0 flex items-end md:items-center md:justify-center bg-black/50 backdrop-blur-sm ${
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
      style={{ zIndex: Z_INDEX.PRIORITY_MODAL }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onSkip();
      }}
    >
      <div
        ref={focusTrapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className={`relative w-full md:max-w-lg rounded-t-3xl md:rounded-3xl bg-bg-surface shadow-2xl md:border md:border-border-default overflow-hidden ${
          isAnimating ? 'modal-content-enter' : 'modal-content-exit'
        }`}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden" aria-hidden="true">
          <div className="h-1 w-12 rounded-full bg-border-default" />
        </div>

        {/* Header: skip button + step dots */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          {/* Step indicator dots */}
          <div className="flex items-center gap-1.5" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={totalSteps} aria-label={t('onboarding.stepIndicator', { current: currentStep + 1, total: totalSteps })}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-6 bg-orange-500'
                    : index < currentStep
                    ? 'w-1.5 bg-orange-300'
                    : 'w-1.5 bg-border-default'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Skip button — hide on last step */}
          {currentStep < totalSteps - 1 && (
            <button
              type="button"
              onClick={onSkip}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-text-tertiary transition-colors hover:bg-bg-hover hover:text-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              aria-label={t('onboarding.skip')}
            >
              {t('onboarding.skip')}
            </button>
          )}
        </div>

        {/* Step content with framer-motion slide animation */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={STEP_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={STEP_TRANSITION}
              className="px-5 pb-8"
            >
              <span id="onboarding-title" className="sr-only">
                {t('onboarding.stepIndicator', { current: currentStep + 1, total: totalSteps })}
              </span>
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>,
    document.body
  );
}
