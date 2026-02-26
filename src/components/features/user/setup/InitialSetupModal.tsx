/**
 * 초기 설정 모달 컴포넌트
 * 로그인 후 필요한 정보(이름, 주소, 취향)를 입력받는 다이얼로그
 */

import { authService } from '@/api/services/auth';
import { userService } from '@/api/services/user';
import { Button } from '@/components/common/Button';
import { InitialSetupAddressSection } from './InitialSetupAddressSection';
import { InitialSetupPreferencesSection } from './InitialSetupPreferencesSection';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useModalScrollLock } from '@/hooks/common/useModalScrollLock';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import type { SelectedAddress } from '@/types/user';
import type { UserSetupStatus } from '@/utils/userSetup';
import { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface InitialSetupModalProps {
  open: boolean;
  setupStatus: UserSetupStatus;
  onComplete: () => void;
}

export const InitialSetupModal = ({
  open,
  setupStatus,
  onComplete,
}: InitialSetupModalProps) => {
  const dispatch = useAppDispatch();
  const { handleError } = useErrorHandler();
  const { t } = useTranslation();

  // 모달이 열릴 때의 setupStatus를 캡처하여 wizard 진행 중 steps가 변하지 않도록 고정
  const initialSetupStatusRef = useRef<UserSetupStatus>(setupStatus);

  // 이름 관련
  const [name, setName] = useState('');

  // 주소 관련
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [addressAlias, setAddressAlias] = useState('');

  // 취향 관련
  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);

  // 저장 중 상태
  const [isSaving, setIsSaving] = useState(false);

  // 단계별 wizard 상태
  const steps = useMemo(() => {
    const status = initialSetupStatusRef.current;
    const s: Array<'name' | 'address' | 'preferences'> = [];
    if (status.needsName) s.push('name');
    if (status.needsAddress) s.push('address');
    if (status.needsPreferences) s.push('preferences');
    return s;
  }, [open]); // Recalculate when modal opens (captures frozen setupStatus from ref)

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const isLastStep = currentStepIndex === totalSteps - 1;

  useEffect(() => {
    if (open) {
      // 모달이 열릴 때 현재 setupStatus를 캡처
      initialSetupStatusRef.current = setupStatus;
    } else {
      // 모달이 닫히면 상태 초기화
      setName('');
      setSelectedAddress(null);
      setAddressAlias('');
      setLikes([]);
      setDislikes([]);
      setCurrentStepIndex(0);
    }
    // Only capture setupStatus when modal opens, not on every setupStatus change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 모달 열림/닫힘 시 body 스크롤 방지
  useModalScrollLock(open);

  // 현재 단계 진행 가능 여부
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 'name': return name.trim().length > 0;
      case 'address': return selectedAddress !== null;
      case 'preferences': return likes.length > 0 || dislikes.length > 0;
      default: return false;
    }
  }, [currentStep, name, selectedAddress, likes, dislikes]);

  // 현재 단계 저장
  const saveCurrentStep = async () => {
    setIsSaving(true);
    try {
      switch (currentStep) {
        case 'name':
          if (name.trim()) {
            const nameResult = await authService.updateUser({ name: name.trim() });
            dispatch(updateUser({ name: nameResult.name || name.trim() }));
          }
          break;
        case 'address':
          if (selectedAddress) {
            const addressResult = await userService.setAddress(selectedAddress);

            // 별칭이 있으면 주소 리스트를 조회해서 방금 추가된 주소에 별칭 설정
            if (addressAlias.trim()) {
              try {
                const addressesResponse = await userService.getAddresses();
                // 응답이 배열인지 객체인지 확인
                const addresses = Array.isArray(addressesResponse)
                  ? addressesResponse
                  : addressesResponse?.addresses || [];

                const newAddress = addresses.find(
                  (addr) => addr.roadAddress === addressResult.roadAddress
                );

                if (newAddress) {
                  await userService.updateAddress(newAddress.id, { alias: addressAlias.trim() });
                }
              } catch {
                // 별칭 설정 실패해도 주소 저장은 성공한 것으로 처리
              }
            }

            const latitudeValue = selectedAddress.latitude ? parseFloat(selectedAddress.latitude) : null;
            const longitudeValue = selectedAddress.longitude ? parseFloat(selectedAddress.longitude) : null;
            const normalizedLatitude = latitudeValue !== null && !Number.isNaN(latitudeValue) ? latitudeValue : null;
            const normalizedLongitude = longitudeValue !== null && !Number.isNaN(longitudeValue) ? longitudeValue : null;

            dispatch(
              updateUser({
                address: addressResult.roadAddress,
                latitude: normalizedLatitude,
                longitude: normalizedLongitude,
              })
            );
          }
          break;
        case 'preferences':
          await userService.setPreferences({ likes, dislikes });
          dispatch(updateUser({ preferences: { likes, dislikes } }));
          break;
      }
    } catch (error: unknown) {
      handleError(error, 'InitialSetupModal');
      return false;
    } finally {
      setIsSaving(false);
    }
    return true;
  };

  // 다음 단계로 이동 또는 완료
  const handleNext = async () => {
    const saved = await saveCurrentStep();
    if (saved && !isLastStep) {
      setCurrentStepIndex(prev => prev + 1);
    } else if (saved && isLastStep) {
      onComplete();
    }
  };

  // 단계 건너뛰기
  const handleSkip = () => {
    if (!isLastStep) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(open);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!shouldRender) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 ${
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[var(--radius-xl)] border-border-default bg-bg-primary p-8 shadow-[var(--shadow-card)] ${
          isAnimating ? 'modal-content-enter' : 'modal-content-exit'
        }`}
      >
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">
                {currentStepIndex + 1}/{totalSteps}
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-bg-secondary">
              <div
                className="h-1 rounded-full bg-brand-primary"
                style={{
                  width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
                  transition: 'width var(--duration-moderate) var(--ease-smooth)'
                }}
              />
            </div>
          </div>

          {/* Step title and description */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary">
              {currentStep === 'name' && t('setup.name.title')}
              {currentStep === 'address' && t('setup.address.title')}
              {currentStep === 'preferences' && t('setup.preferences.title')}
            </h2>
            <p className="mt-2 text-sm text-text-tertiary">
              {currentStep === 'name' && t('setup.name.description')}
              {currentStep === 'address' && t('setup.address.description')}
              {currentStep === 'preferences' && t('setup.preferences.description')}
            </p>
          </div>

          {/* Step content */}
          {currentStep === 'name' && (
            <div className="rounded-[var(--radius-lg)] border-border-default bg-bg-secondary p-6 animate-fade-in-up">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('setup.name.placeholder')}
                className="w-full rounded-[var(--radius-md)] border-border-default bg-bg-surface px-4 py-3 text-text-primary placeholder-text-tertiary transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              />
            </div>
          )}

          {currentStep === 'address' && (
            <InitialSetupAddressSection
              selectedAddress={selectedAddress}
              addressAlias={addressAlias}
              onAddressChange={setSelectedAddress}
              onAddressAliasChange={setAddressAlias}
            />
          )}

          {currentStep === 'preferences' && (
            <InitialSetupPreferencesSection
              likes={likes}
              dislikes={dislikes}
              onLikesChange={setLikes}
              onDislikesChange={setDislikes}
            />
          )}

          {/* Bottom buttons */}
          <div className="mt-8 space-y-3">
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              isLoading={isSaving}
              size="lg"
              variant="primary"
              className="w-full"
            >
              {isLastStep ? t('setup.complete') : t('setup.next')}
            </Button>
            {currentStep !== 'name' && (
              <button
                onClick={handleSkip}
                className="w-full text-center text-sm text-text-tertiary transition hover:text-text-secondary"
              >
                {t('setup.skip')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

