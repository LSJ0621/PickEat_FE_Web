/**
 * 주소 등록 모달 컴포넌트
 * 로그인 후 주소가 없을 때 주소를 등록하는 모달
 */

import { userService } from '@/api/services/user';
import { AddressSearchInput } from './AddressSearchInput';
import { AddressSearchResults } from '@/components/common/AddressSearchResults';
import { Button } from '@/components/common/Button';
import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import { useAddressSearch } from '@/hooks/address/useAddressSearch';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useModalAnimation } from '@/hooks/common/useModalAnimation';
import { useModalScrollLock } from '@/hooks/common/useModalScrollLock';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import { Z_INDEX } from '@/utils/constants';
import { useEffect } from 'react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface AddressRegistrationModalProps {
  open: boolean;
  onComplete: () => void;
  onClose?: () => void;
}

export const AddressRegistrationModal = ({
  open,
  onComplete,
  onClose,
}: AddressRegistrationModalProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const addressSearch = useAddressSearch();
  const { handleError, handleSuccess } = useErrorHandler();
  const { isAnimating, shouldRender } = useModalAnimation(open);

  const [alias, setAlias] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      addressSearch.clearSearch();
      addressSearch.setSelectedAddress(null);
      setAlias('');
    }
    // Follow project convention: use [hook.method] not [hook] to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, addressSearch.clearSearch, addressSearch.setSelectedAddress]);

  useModalScrollLock(open);

  const handleSave = async () => {
    if (!addressSearch.selectedAddress) {
      handleError(t('validation.address.required'), 'AddressRegistration');
      return;
    }

    setIsSaving(true);
    try {
      const addressResult = await userService.setAddress(addressSearch.selectedAddress);

      if (alias.trim()) {
        try {
          const addressesResponse = await userService.getAddresses();
          const addresses = Array.isArray(addressesResponse)
            ? addressesResponse
            : addressesResponse?.addresses || [];
          const newAddress = addresses.find(
            (addr) => addr.roadAddress === addressResult.roadAddress
          );
          if (newAddress) {
            await userService.updateAddress(newAddress.id, { alias: alias.trim() });
          }
        } catch {
          // 별칭 설정 실패해도 주소 저장은 성공한 것으로 처리
        }
      }

      const latitudeValue = addressSearch.selectedAddress.latitude
        ? parseFloat(addressSearch.selectedAddress.latitude)
        : null;
      const longitudeValue = addressSearch.selectedAddress.longitude
        ? parseFloat(addressSearch.selectedAddress.longitude)
        : null;
      const normalizedLatitude =
        latitudeValue !== null && !Number.isNaN(latitudeValue) ? latitudeValue : null;
      const normalizedLongitude =
        longitudeValue !== null && !Number.isNaN(longitudeValue) ? longitudeValue : null;

      dispatch(
        updateUser({
          address: addressResult.roadAddress,
          latitude: normalizedLatitude,
          longitude: normalizedLongitude,
        })
      );

      handleSuccess(t('setup.address.registered'));
      onComplete();
    } catch (error: unknown) {
      handleError(error, 'AddressRegistration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving && onClose) onClose();
  };

  if (!shouldRender) return null;

  return createPortal(
    <div
      className={`fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4
        bg-black/40 backdrop-blur-sm transition-opacity duration-300
        ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
      style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-registration-title"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
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
              id="address-registration-title"
              className="text-xl sm:text-2xl font-bold text-text-primary"
            >
              {t('setup.address.titleModal')}
            </h2>
            <p className="mt-2 text-sm text-text-tertiary leading-relaxed">
              {t('setup.address.descriptionModal')}
            </p>
          </div>

          {/* 닫기 버튼 */}
          {onClose && (
            <ModalCloseButton onClose={handleClose} aria-label={t('common.close')} />
          )}

          {/* 주소 검색 섹션 */}
          <div className="rounded-2xl border border-border-default bg-bg-secondary p-5">
            <div className="mb-3">
              <h3 className="text-base font-semibold text-text-primary">
                {t('setup.address.search')}
              </h3>
              <p className="mt-1 text-xs text-text-tertiary">
                {t('setup.address.searchDesc')}
              </p>
            </div>
            <div className="space-y-3">
              <AddressSearchInput
                addressQuery={addressSearch.addressQuery}
                isSearching={addressSearch.isSearching}
                onAddressQueryChange={addressSearch.setAddressQuery}
                onSearch={addressSearch.handleSearch}
              />
              <AddressSearchResults
                searchResults={addressSearch.searchResults}
                isSearching={addressSearch.isSearching}
                hasSearchedAddress={addressSearch.hasSearchedAddress}
                onSelectAddress={addressSearch.handleSelectAddress}
              />
              {addressSearch.selectedAddress && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-xs font-medium text-emerald-400">
                    {t('setup.address.selected')}
                  </p>
                  <p className="mt-1 text-sm text-text-primary font-medium">
                    {addressSearch.selectedAddress.roadAddress ||
                      addressSearch.selectedAddress.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 별칭 입력 섹션 */}
          {addressSearch.selectedAddress && (
            <div className="rounded-2xl border border-border-default bg-bg-secondary p-5">
              <div className="mb-3">
                <h3 className="text-base font-semibold text-text-primary">
                  {t('setup.address.alias')}
                </h3>
                <p className="mt-1 text-xs text-text-tertiary">
                  {t('setup.address.aliasDescription')}
                </p>
              </div>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder={t('setup.address.aliasPlaceholder')}
                maxLength={20}
                aria-label={t('setup.address.alias')}
                className="w-full rounded-xl border border-border-default bg-bg-surface px-4 py-3
                  text-sm text-text-primary placeholder-text-placeholder
                  transition focus:border-border-focus focus:outline-none
                  focus:ring-2 focus:ring-brand-primary/40"
              />
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3 pt-1">
            {onClose && (
              <Button
                variant="ghost"
                size="lg"
                onClick={handleClose}
                disabled={isSaving}
                className="flex-1 border border-border-default bg-bg-secondary
                  text-text-primary hover:bg-bg-hover"
              >
                {t('common.cancel')}
              </Button>
            )}
            <Button
              variant="primary"
              size="lg"
              onClick={handleSave}
              isLoading={isSaving}
              disabled={!addressSearch.selectedAddress || isSaving}
              className="flex-1 bg-gradient-to-r from-brand-primary to-rose-500
                px-6 text-text-inverse shadow-md shadow-brand-primary/30"
            >
              {t('setup.register')}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
