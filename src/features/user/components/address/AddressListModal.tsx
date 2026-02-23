import { useTranslation } from 'react-i18next';
import { Button } from '@shared/components/Button';
import { ModalCloseButton } from '@shared/components/ModalCloseButton';
import type { UserAddress } from '@features/user/types';
import { createPortal } from 'react-dom';
import { useModalAnimation } from '@shared/hooks/useModalAnimation';
import { useModalScrollLock } from '@shared/hooks/useModalScrollLock';
import { useEscapeKey } from '@shared/hooks/useEscapeKey';
import { useFocusTrap } from '@shared/hooks/useFocusTrap';
import { Z_INDEX } from '@shared/utils/constants';

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

  const handleClose = () => {
    onEditModeChange(false);
    onClose();
  };

  useEscapeKey(handleClose, open);

  if (!shouldRender) return null;

  const defaultAddr = defaultAddress || addresses.find((addr) => addr.isDefault);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-list-title"
      className={[
        'fixed inset-0 flex p-4 bg-black/40 backdrop-blur-sm',
        'items-end sm:items-center',
        `z-[${Z_INDEX.MODAL_BACKDROP}]`,
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit',
      ].join(' ')}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        ref={focusTrapRef}
        className={[
          'relative w-full max-w-2xl mx-auto bg-bg-surface border border-border-default shadow-2xl',
          'rounded-t-2xl sm:rounded-2xl',
          'p-6 sm:p-8 max-h-[90vh] overflow-y-auto',
          isAnimating ? 'modal-content-enter' : 'modal-content-exit',
        ].join(' ')}
      >
        <ModalCloseButton onClose={handleClose} />
        <div className="flex items-center justify-between mb-6 pr-8">
          <h2 id="address-list-title" className="text-2xl font-bold text-text-primary">
            {t('user.address.title')}
          </h2>
          {!isEditMode && addresses.length > 1 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEditModeChange(true)}
              className="border border-border-default bg-bg-secondary text-text-primary hover:bg-bg-hover"
            >
              {t('user.address.edit')}
            </Button>
          )}
          {isEditMode && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEditModeChange(false)}
              className="border border-border-default bg-bg-secondary text-text-primary hover:bg-bg-hover"
            >
              {t('user.address.done')}
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {/* Default address */}
          {defaultAddr && (
            <div className="rounded-2xl border border-brand-primary/30 bg-brand-primary/10 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 rounded-full bg-brand-primary/20 px-2 py-0.5 text-xs font-semibold text-brand-primary">
                  {t('user.address.default')}
                </span>
                <div className="flex-1 min-w-0">
                  {defaultAddr.alias && (
                    <p className="text-xs font-medium text-brand-primary mb-0.5">{defaultAddr.alias}</p>
                  )}
                  <p className="text-sm font-medium text-text-primary">{defaultAddr.roadAddress}</p>
                  {defaultAddr.postalCode && (
                    <p className="mt-0.5 text-xs text-text-tertiary">{defaultAddr.postalCode}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Other addresses */}
          {addresses
            .filter((addr) => !addr.isDefault)
            .map((address) => (
              <div
                key={address.id}
                onClick={() => { if (!isEditMode) onAddressClick(address); }}
                className={[
                  'rounded-2xl border p-4 transition',
                  isEditMode && selectedDeleteIds.includes(address.id)
                    ? 'cursor-pointer border-red-500/50 bg-red-500/15'
                    : isEditMode
                    ? 'cursor-pointer border-border-default bg-bg-secondary hover:bg-bg-hover'
                    : 'cursor-pointer border-border-default bg-bg-secondary hover:border-brand-primary/30 hover:bg-bg-hover',
                ].join(' ')}
              >
                <div className="flex items-start gap-3">
                  {isEditMode && (
                    <input
                      type="checkbox"
                      checked={selectedDeleteIds.includes(address.id)}
                      onChange={(e) => { e.stopPropagation(); onToggleDeleteSelection(address.id); }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 h-4 w-4 rounded border-border-default bg-bg-secondary accent-brand-primary"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    {address.alias && (
                      <p className="text-xs font-medium text-brand-primary mb-0.5">{address.alias}</p>
                    )}
                    <p className="text-sm font-medium text-text-primary">{address.roadAddress}</p>
                    {address.postalCode && (
                      <p className="mt-0.5 text-xs text-text-tertiary">{address.postalCode}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

          {addresses.length === 0 && (
            <p className="py-8 text-center text-sm text-text-tertiary">
              {t('user.address.noAddresses')}
            </p>
          )}

          {/* Delete button in edit mode */}
          {isEditMode && selectedDeleteIds.length > 0 && (
            <Button
              size="lg"
              variant="primary"
              onClick={() => onDeleteAddresses(selectedDeleteIds)}
              className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-500/30"
            >
              {t('user.address.deleteSelected', { count: selectedDeleteIds.length })}
            </Button>
          )}

          {/* Add address button */}
          {!isEditMode && addresses.length < 4 && (
            <Button
              size="lg"
              variant="primary"
              onClick={onAddAddress}
              className="w-full bg-gradient-to-r from-brand-primary to-rose-500 text-text-inverse shadow-md shadow-brand-primary/30"
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
