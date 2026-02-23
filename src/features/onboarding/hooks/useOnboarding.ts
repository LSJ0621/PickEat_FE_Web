/**
 * useOnboarding Hook
 * 온보딩 상태와 로직을 관리하는 커스텀 훅
 *
 * Usage:
 *   const { isOpen, currentStep, totalSteps, checkOnboarding, nextStep, prevStep, complete, skip } = useOnboarding();
 */

import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS } from '@shared/utils/constants';

export function useOnboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = 5;

  // 온보딩 표시 여부 확인 (isAuthenticated가 true가 될 때 호출)
  const checkOnboarding = useCallback(() => {
    const completed = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    if (!completed) {
      setIsOpen(true);
      setCurrentStep(0);
    }
  }, []);

  // MyPage "이용 가이드"에서 발생하는 CustomEvent 리스너
  useEffect(() => {
    const handler = () => {
      setIsOpen(true);
      setCurrentStep(0);
    };
    window.addEventListener('openOnboarding', handler);
    return () => window.removeEventListener('openOnboarding', handler);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const complete = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    setIsOpen(false);
    setCurrentStep(0);
  }, []);

  const skip = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    setIsOpen(false);
    setCurrentStep(0);
  }, []);

  return {
    isOpen,
    currentStep,
    totalSteps,
    checkOnboarding,
    nextStep,
    prevStep,
    complete,
    skip,
  };
}
