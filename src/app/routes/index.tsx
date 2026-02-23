/**
 * 라우팅 설정
 * Auth 초기화, 모달, RouterProvider를 관리합니다.
 */

import { useEffect, useRef } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ROUTES } from './paths';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import { initializeAuth } from '@app/store/slices/authSlice';
import { useRatingPrompt } from '@features/rating/hooks/useRatingPrompt';
import { RatingPromptModal } from '@features/rating/components/RatingPromptModal';
import { useOnboarding } from '@features/onboarding/hooks/useOnboarding';
import { OnboardingModal } from '@features/onboarding/components/OnboardingModal';

export default function Routes() {
  const dispatch = useAppDispatch();
  const hasInitialized = useRef(false);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const {
    pendingRating,
    isModalOpen,
    isSubmitting,
    checkPendingRating,
    skipPlace,
    dismissRating,
    dismissPermanently,
    goToHistory,
  } = useRatingPrompt();
  const {
    isOpen: isOnboardingOpen,
    currentStep,
    totalSteps,
    checkOnboarding,
    nextStep,
    prevStep,
    complete: completeOnboarding,
    skip: skipOnboarding,
  } = useOnboarding();
  const lastCheckedDate = useRef(new Date().toDateString());

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      checkPendingRating();
      checkOnboarding();
    }
  }, [isAuthenticated, checkPendingRating, checkOnboarding]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      const today = new Date().toDateString();
      if (today !== lastCheckedDate.current) {
        lastCheckedDate.current = today;
        checkPendingRating();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, checkPendingRating]);

  const handleGoToHistory = () => {
    goToHistory();
    router.navigate(ROUTES.RATINGS_HISTORY);
  };

  return (
    <>
      <RouterProvider router={router} />
      <RatingPromptModal
        open={isModalOpen}
        placeName={pendingRating?.placeName ?? ''}
        onGoToHistory={handleGoToHistory}
        onSkipPlace={skipPlace}
        onDismiss={dismissRating}
        onNeverShow={dismissPermanently}
        isSubmitting={isSubmitting}
      />
      <OnboardingModal
        isOpen={isOnboardingOpen}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={nextStep}
        onPrev={prevStep}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
      />
    </>
  );
}
