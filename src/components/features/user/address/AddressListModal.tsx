import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';
import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import { useModalAnimation } from '@/hooks/common/useModalAnimation';
import { useModalScrollLock } from '@/hooks/common/useModalScrollLock';
import { useFocusTrap } from '@/hooks/common/useFocusTrap';
import type { UserAddress } from '@/types/user';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { Home, MapPin } from 'lucide-react';

interface AddressListModalProps {
  open: boolean;
  addresses: UserAddress[];
  defaultAddress: UserAddress | null;
  isEditMode: boolean;
  selectedDeleteIds: number[];
  onClose: () => void;
  onEditModeChange: (isEdit: boolean) => void;
  onAddressClick: (address: UserAddress) => void;
  onToggleDeleteSelection: (id: number) => void;
  onDeleteAddresses: (ids: number[]) => void;
  onAddAddress: () => void;
}

export const AddressListModal = ({
  open,
  addresses,
  defaultAddress,
  isEditMode,
  selectedDeleteIds,
  onClose,
  onEditModeChange,
  onAddressClick,
  onToggleDeleteSelection,
  onDeleteAddresses,
  onAddAddress,
}: AddressListModalProps) => {
  const { t } = useTranslation();
  const { isAnimating, shouldRender } = useModalAnimation(open);
  useModalScrollLock(open);
  const focusTrapRef = useFocusTrap(open);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEditModeChange(false);
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onEditModeChange, onClose]);

  if (!shouldRender) {
    return null;
  }

  const handleClose = () => {
    onEditModeChange(false);
    onClose();
  };

  const handleEditComplete = () => {
    onEditModeChange(false);
  };

  const defaultAddr = defaultAddress || addresses.find((addr) => addr.isDefault);

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-end md:items-center md:justify-center bg-black/40 backdrop-blur-sm p-4 ${
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={focusTrapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-list-modal-title"
        className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-t-xl md:rounded-xl bg-bg-surface p-6 md:p-8 shadow-lg md:border md:border-border-default ${
          isAnimating ? 'modal-content-responsive-enter' : 'modal-content-responsive-exit'
        }`}
      >
        <div className="flex justify-center pb-3 md:hidden">
          <div className="h-1 w-12 rounded-full bg-border-default" />
        </div>

        <ModalCloseButton onClose={handleClose} />
        <div className="flex items-center justify-between mb-6 pr-12">
          <h2 id="address-list-modal-title" className="text-xl font-semibold text-text-primary">{t('user.address.title')}</h2>
          {!isEditMode && addresses.length > 1 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEditModeChange(true)}
            >
              {t('user.address.edit')}
            </Button>
          )}
          {isEditMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleEditComplete}
            >
              {t('user.address.done')}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {/* 기본주소 표시 */}
          {defaultAddr && (
            <div className="rounded-[var(--radius-md)] border-border-default bg-bg-surface p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-tertiary">
                  <Home className="h-4 w-4 text-brand-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {defaultAddr.alias && (
                      <span className="text-brand-primary font-medium">{defaultAddr.alias}</span>
                    )}
                    <span className="rounded-full bg-brand-tertiary px-2 py-0.5 text-xs text-brand-primary">
                      {t('user.address.default', '기본')}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-text-primary">{defaultAddr.roadAddress}</p>
                  {defaultAddr.postalCode && (
                    <p className="mt-0.5 text-xs text-text-tertiary">{defaultAddr.postalCode}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 나머지 주소 리스트 */}
          {addresses.length > 0 && (
            <div className="space-y-2">
              {addresses
                .filter((addr) => !addr.isDefault)
                .map((address) => (
                  <div
                    key={address.id}
                    onClick={() => {
                      if (!isEditMode) {
                        onAddressClick(address);
                      }
                    }}
                    className={`rounded-[var(--radius-md)] border p-4 transition cursor-pointer ${
                      isEditMode && selectedDeleteIds.includes(address.id)
                        ? 'border-error/50 bg-error/20'
                        : isEditMode
                        ? 'border-border-default bg-bg-surface hover:bg-bg-hover'
                        : 'border-border-default bg-bg-surface hover:border-brand-primary/30 hover:bg-bg-hover'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* 삭제 체크박스 (편집 모드에서만 표시) */}
                      {isEditMode && (
                        <input
                          type="checkbox"
                          checked={selectedDeleteIds.includes(address.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            onToggleDeleteSelection(address.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 h-4 w-4 rounded border-border-default bg-bg-surface text-brand-primary focus:ring-brand-primary"
                        />
                      )}
                      {!isEditMode && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-50">
                          <MapPin className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-text-primary font-medium">
                          {address.alias && (
                            <span className="mr-2 text-brand-primary">{address.alias}</span>
                          )}
                          {address.roadAddress}
                        </p>
                        {address.postalCode && (
                          <p className="mt-0.5 text-xs text-text-tertiary">{address.postalCode}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {addresses.length === 0 && (
            <p className="text-center text-text-tertiary py-8">{t('user.address.noAddresses')}</p>
          )}

          {/* 편집 모드에서 선택된 주소 삭제 버튼 */}
          {isEditMode && selectedDeleteIds.length > 0 && (
            <Button
              size="lg"
              variant="danger"
              onClick={() => onDeleteAddresses(selectedDeleteIds)}
              className="w-full"
            >
              {t('user.address.deleteSelected', { count: selectedDeleteIds.length })}
            </Button>
          )}

          {/* 주소 추가 버튼 */}
          {!isEditMode && addresses.length < 4 && (
            <Button
              size="lg"
              variant="primary"
              onClick={onAddAddress}
              className="w-full"
              data-testid="address-list-add-button"
            >
              {t('user.address.addAddress', { current: addresses.length, max: 4 })}
            </Button>
          )}

          {!isEditMode && addresses.length >= 4 && (
            <p className="text-center text-sm text-text-tertiary">
              {t('user.address.maxAddresses', { max: 4 })}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
