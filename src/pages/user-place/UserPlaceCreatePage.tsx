/**
 * User Place 등록 페이지
 */

import { Button } from '@/components/common/Button';
import { UserPlaceForm } from '@/components/features/user-place/UserPlaceForm';
import { CheckRegistrationResult } from '@/components/features/user-place/CheckRegistrationResult';
import { useUserPlaceCreate } from '@/hooks/user-place/useUserPlaceCreate';
import type { CreateUserPlaceRequest, UpdateUserPlaceRequest } from '@/types/user-place';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type Step = 'form' | 'check' | 'complete';

export function UserPlaceCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState<CreateUserPlaceRequest | null>(null);

  const {
    checkResult,
    isCheckLoading,
    isCreateLoading,
    checkRegistration,
    createPlace,
    resetCheck,
  } = useUserPlaceCreate();

  // 폼 제출 (1단계 → 2단계: 확인)
  const handleFormSubmit = useCallback(
    async (data: CreateUserPlaceRequest | UpdateUserPlaceRequest) => {
      // This page only creates, so data will always be CreateUserPlaceRequest
      const createData = data as CreateUserPlaceRequest;
      setFormData(createData);
      await checkRegistration({
        name: createData.name,
        address: createData.address,
        latitude: createData.latitude,
        longitude: createData.longitude,
      });
      setStep('check');
    },
    [checkRegistration]
  );

  // 확인 후 등록 (2단계 → 3단계: 완료)
  const handleConfirmCreate = useCallback(async () => {
    if (!formData) return;

    try {
      await createPlace(formData);
      setStep('complete');
    } catch {
      // 에러는 hook에서 처리
    }
  }, [formData, createPlace]);

  // 뒤로 가기
  const handleBack = useCallback(() => {
    if (step === 'check') {
      setStep('form');
      resetCheck();
    } else if (step === 'complete') {
      navigate('/user-places');
    }
  }, [step, navigate, resetCheck]);

  // 취소
  const handleCancel = useCallback(() => {
    navigate('/user-places');
  }, [navigate]);

  // 목록으로
  const handleGoToList = useCallback(() => {
    navigate('/user-places');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            {t('userPlace.createTitle')}
          </h1>
          <p className="mt-2 text-slate-400">{t('userPlace.createSubtitle')}</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
              step === 'form'
                ? 'border-orange-400 bg-orange-400 text-white'
                : 'border-white/20 bg-white/5 text-slate-400'
            }`}
          >
            1
          </div>
          <div className="h-0.5 w-16 bg-white/20" />
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
              step === 'check' || step === 'complete'
                ? 'border-orange-400 bg-orange-400 text-white'
                : 'border-white/20 bg-white/5 text-slate-400'
            }`}
          >
            2
          </div>
          <div className="h-0.5 w-16 bg-white/20" />
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
              step === 'complete'
                ? 'border-orange-400 bg-orange-400 text-white'
                : 'border-white/20 bg-white/5 text-slate-400'
            }`}
          >
            3
          </div>
        </div>

        {/* Content */}
        <div className="rounded-[32px] border border-white/10 bg-slate-900/50 p-8 backdrop-blur">
          {step === 'form' && (
            <div>
              <h2 className="mb-6 text-xl font-bold text-white">
                {t('userPlace.step1Title')}
              </h2>
              <UserPlaceForm
                onSubmit={(data) => void handleFormSubmit(data)}
                onCancel={handleCancel}
                isLoading={isCheckLoading}
                submitLabel={t('userPlace.nextStep')}
              />
            </div>
          )}

          {step === 'check' && checkResult && (
            <div>
              <h2 className="mb-6 text-xl font-bold text-white">
                {t('userPlace.step2Title')}
              </h2>
              <CheckRegistrationResult result={checkResult} />

              <div className="mt-6 flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={handleBack}
                  disabled={isCreateLoading}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => void handleConfirmCreate()}
                  isLoading={isCreateLoading}
                  disabled={!checkResult.canRegister}
                >
                  {t('userPlace.confirmCreate')}
                </Button>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                  <svg
                    className="h-10 w-10 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="mb-3 text-2xl font-bold text-white">
                {t('userPlace.createComplete')}
              </h2>
              <p className="mb-8 text-slate-400">
                {t('userPlace.createCompleteMessage')}
              </p>
              <Button variant="primary" onClick={handleGoToList}>
                {t('userPlace.goToList')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
