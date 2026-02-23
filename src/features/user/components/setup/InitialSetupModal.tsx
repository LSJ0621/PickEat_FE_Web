/**
 * 초기 설정 모달 컴포넌트
 * 로그인 후 필요한 정보(이름, 주소, 취향)를 입력받는 다이얼로그
 */

import { authService } from '@features/auth/api';
import { userService } from '@features/user/api';
import { Button } from '@shared/components/Button';
import { InitialSetupAddressSection } from './InitialSetupAddressSection';
import { InitialSetupPreferencesSection } from './InitialSetupPreferencesSection';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';
import { useModalAnimation } from '@shared/hooks/useModalAnimation';
import { useModalScrollLock } from '@shared/hooks/useModalScrollLock';
import { useAppDispatch } from '@app/store/hooks';
import { updateUser } from '@app/store/slices/authSlice';
import type { SelectedAddress } from '@features/user/types';
import { isEmpty } from '@shared/utils/validation';
import { ERROR_MESSAGES, Z_INDEX } from '@shared/utils/constants';
import type { UserSetupStatus } from '@shared/utils/userSetup';
import { useEffect, useCallback, useState } from 'react';
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
  const { isAnimating, shouldRender } = useModalAnimation(open);

  const [name, setName] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [addressAlias, setAddressAlias] = useState('');
  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setName('');
      setSelectedAddress(null);
      setAddressAlias('');
      setLikes([]);
      setDislikes([]);
    }
  }, [open]);

  useModalScrollLock(open);

  const handleSaveAll = useCallback(async () => {
    if (setupStatus.needsName && isEmpty(name)) {
      handleError(ERROR_MESSAGES.NAME_REQUIRED, 'InitialSetupModal');
      return;
    }
    if (setupStatus.needsAddress && !selectedAddress) {
      handleError(t('validation.address.required'), 'InitialSetupModal');
      return;
    }

    setIsSaving(true);
    try {
      if (setupStatus.needsName && name.trim()) {
        const nameResult = await authService.updateUser({ name: name.trim() });
        dispatch(updateUser({ name: nameResult.name || name.trim() }));
      }

      if (setupStatus.needsAddress && selectedAddress) {
        const addressResult = await userService.setAddress(selectedAddress);

        if (addressAlias.trim()) {
          try {
            const addressesResponse = await userService.getAddresses();
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

      if (setupStatus.needsPreferences) {
        await userService.setPreferences({ likes, dislikes });
        dispatch(updateUser({ preferences: { likes, dislikes } }));
      }

      onComplete();
    } catch (error: unknown) {
      handleError(error, 'InitialSetupModal');
    } finally {
      setIsSaving(false);
    }
  }, [setupStatus, name, selectedAddress, addressAlias, likes, dislikes, dispatch, handleError, onComplete, t]);

  const canSave =
    (!setupStatus.needsName || name.trim()) &&
    (!setupStatus.needsAddress || selectedAddress !== null) &&
    (!setupStatus.needsPreferences || likes.length > 0 || dislikes.length > 0);

  if (!shouldRender) return null;

  return createPortal(
    <div
      className={`fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4
        bg-black/40 backdrop-blur-sm transition-opacity duration-300
        ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
      style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="initial-setup-title"
      onClick={(e) => e.target === e.currentTarget && undefined}
    >
      <div
        className={`relative w-full sm:max-w-2xl max-h-[95dvh] sm:max-h-[90vh]
          overflow-y-auto bg-bg-surface shadow-2xl shadow-black/30
          rounded-t-2xl sm:rounded-2xl
          transition-all duration-300
          ${isAnimating ? 'opacity-100 translate-y-0 sm:scale-100' : 'opacity-0 translate-y-8 sm:scale-95 sm:translate-y-0'}`}
        style={{ zIndex: Z_INDEX.MODAL_CONTENT }}
      >
        {/* 모바일 드래그 핸들 */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-border-default" />
        </div>

        <div className="px-6 pb-8 pt-4 sm:px-8 sm:pt-8 space-y-5">
          {/* 헤더 */}
          <div className="text-center pr-6">
            <h2
              id="initial-setup-title"
              className="text-xl sm:text-2xl font-bold text-text-primary"
            >
              {t('setup.title')}
            </h2>
            <p className="mt-2 text-sm text-text-tertiary leading-relaxed">
              {t('setup.subtitle')}
            </p>
          </div>

          {/* 이름 입력 섹션 */}
          {setupStatus.needsName && (
            <div className="rounded-2xl border border-border-default bg-bg-secondary p-5">
              <div className="mb-3">
                <h3 className="text-base font-semibold text-text-primary">
                  {t('setup.name.title')}
                </h3>
                <p className="mt-1 text-xs text-text-tertiary">
                  {t('setup.name.description')}
                </p>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('setup.name.placeholder')}
                aria-label={t('setup.name.title')}
                className="w-full rounded-xl border border-border-default bg-bg-surface px-4 py-3
                  text-sm text-text-primary placeholder-text-placeholder
                  transition focus:border-border-focus focus:outline-none
                  focus:ring-2 focus:ring-brand-primary/40"
              />
            </div>
          )}

          {/* 주소 입력 섹션 */}
          {setupStatus.needsAddress && (
            <InitialSetupAddressSection
              selectedAddress={selectedAddress}
              addressAlias={addressAlias}
              onAddressChange={setSelectedAddress}
              onAddressAliasChange={setAddressAlias}
            />
          )}

          {/* 취향 입력 섹션 */}
          {setupStatus.needsPreferences && (
            <InitialSetupPreferencesSection
              likes={likes}
              dislikes={dislikes}
              onLikesChange={setLikes}
              onDislikesChange={setDislikes}
            />
          )}

          {/* 저장 버튼 */}
          <div className="pt-2">
            <Button
              onClick={handleSaveAll}
              isLoading={isSaving}
              disabled={!canSave}
              size="lg"
              className="w-full"
            >
              {t('setup.save')}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
