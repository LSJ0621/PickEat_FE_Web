/**
 * User Place 등록 페이지
 */

import { Button } from '@/components/common/Button';
import { PageContainer } from '@/components/common/PageContainer';
import { PageHeader } from '@/components/common/PageHeader';
import { UserPlaceForm } from '@/components/features/user-place/UserPlaceForm';
import { CheckRegistrationResult } from '@/components/features/user-place/CheckRegistrationResult';
import { useUserPlaceCreate } from '@/hooks/user-place/useUserPlaceCreate';
import type { CreateUserPlaceRequest, UpdateUserPlaceRequest } from '@/types/user-place';
import { cn } from '@/utils';
import { Check } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type Step = 'form' | 'check' | 'complete';

const STEPS: Step[] = ['form', 'check', 'complete'];

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

  const handleFormSubmit = useCallback(
    async (data: CreateUserPlaceRequest | UpdateUserPlaceRequest) => {
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

  const handleConfirmCreate = useCallback(async () => {
    if (!formData) return;
    try {
      await createPlace(formData);
      setStep('complete');
    } catch {
      // 에러는 hook에서 처리
    }
  }, [formData, createPlace]);

  const handleBack = useCallback(() => {
    if (step === 'check') {
      setStep('form');
      resetCheck();
    } else if (step === 'complete') {
      navigate('/user-places');
    }
  }, [step, navigate, resetCheck]);

  const handleCancel = useCallback(() => {
    navigate('/user-places');
  }, [navigate]);

  const handleGoToList = useCallback(() => {
    navigate('/user-places');
  }, [navigate]);

  const currentStepIndex = STEPS.indexOf(step);

  return (
    <PageContainer maxWidth="max-w-2xl">
      <PageHeader
        title={t('userPlace.createTitle')}
        subtitle={t('userPlace.createSubtitle')}
      />

      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-center">
        {STEPS.map((s, i) => {
          const isDone = currentStepIndex > i;
          const isActive = currentStepIndex === i;
          return (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                  isDone
                    ? 'border-brand-primary bg-brand-primary text-text-inverse'
                    : isActive
                      ? 'border-brand-primary bg-brand-primary text-text-inverse shadow-md shadow-brand-primary/30'
                      : 'border-border-default bg-bg-secondary text-text-tertiary'
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 w-14 rounded-full transition-all',
                    currentStepIndex > i ? 'bg-brand-primary' : 'bg-border-default'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-border-default bg-bg-surface p-6 shadow-lg shadow-black/10 sm:p-8">
        {step === 'form' && (
          <div>
            <h2 className="mb-6 text-lg font-bold text-text-primary sm:text-xl">
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
            <h2 className="mb-6 text-lg font-bold text-text-primary sm:text-xl">
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
          <div className="py-4 text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                <Check className="h-10 w-10 text-green-500" strokeWidth={2.5} />
              </div>
            </div>
            <h2 className="mb-3 text-2xl font-bold text-text-primary">
              {t('userPlace.createComplete')}
            </h2>
            <p className="mb-8 text-text-tertiary">{t('userPlace.createCompleteMessage')}</p>
            <Button variant="primary" onClick={handleGoToList}>
              {t('userPlace.goToList')}
            </Button>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
