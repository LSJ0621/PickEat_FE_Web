/**
 * MyAddressPage - 주소 관리 페이지
 * 주소 목록 관리 + 추가/삭제 모달
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { createPortal } from 'react-dom';
import { PageContainer } from '@shared/components/PageContainer';
import { PageHeader } from '@shared/components/PageHeader';
import { Button } from '@shared/components/Button';
import { AddressSection } from '@features/user/components/address/AddressSection';
import { AddressListModal } from '@features/user/components/address/AddressListModal';
import { AddressAddModal } from '@features/user/components/address/AddressAddModal';
import { useAddressList } from '@shared/hooks/address/useAddressList';
import { useAddressModal } from '@shared/hooks/address/useAddressModal';
import { useModalAnimation } from '@shared/hooks/useModalAnimation';
import { useAppSelector } from '@app/store/hooks';
import { Z_INDEX } from '@shared/utils/constants';

export function MyAddressPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth?.user);

  const addressList = useAddressList();
  const addressModal = useAddressModal({
    addressesCount: addressList.addresses.length,
    onAddressAdded: addressList.loadAddresses,
  });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddressListModal, setShowAddressListModal] = useState(false);

  const confirmModalAnimation = useModalAnimation(addressList.confirmDefaultAddress !== null);
  const prevShowAddressListModalRef = useRef<boolean>(false);

  // Load addresses on mount
  useEffect(() => {
    addressList.loadAddresses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload addresses when address list modal closes
  useEffect(() => {
    if (prevShowAddressListModalRef.current && !showAddressListModal) {
      addressList.loadAddresses();
    }
    prevShowAddressListModalRef.current = showAddressListModal;
  }, [showAddressListModal, addressList.loadAddresses]);

  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    addressModal.resetAddressModal();
  };

  const handleCloseAddressListModal = () => {
    setShowAddressListModal(false);
    addressList.resetAddressListModal();
  };

  const handleAddAddressFromList = () => {
    setShowAddressListModal(false);
    setShowAddressModal(true);
  };

  return (
    <PageContainer maxWidth="max-w-3xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/mypage')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">{t('navigation.back')}</span>
        </button>
      </div>

      <PageHeader title={t('user.tabs.address')} />

      <div className="space-y-4">
        <AddressSection
          userAddress={user?.address}
          addresses={addressList.addresses}
          onManageClick={() => setShowAddressListModal(true)}
        />

        <AddressListModal
          open={showAddressListModal}
          addresses={addressList.addresses}
          defaultAddress={addressList.defaultAddress}
          isEditMode={addressList.isEditMode}
          selectedDeleteIds={addressList.selectedDeleteIds}
          onClose={handleCloseAddressListModal}
          onEditModeChange={addressList.setIsEditMode}
          onAddressClick={addressList.handleAddressClick}
          onToggleDeleteSelection={addressList.handleToggleDeleteSelection}
          onDeleteAddresses={addressList.handleDeleteAddresses}
          onAddAddress={handleAddAddressFromList}
        />

        <AddressAddModal
          open={showAddressModal}
          addresses={addressList.addresses}
          addressQuery={addressModal.addressQuery}
          searchResults={addressModal.searchResults}
          isSearching={addressModal.isSearching}
          selectedAddress={addressModal.selectedAddress}
          addressAlias={addressModal.addressAlias}
          isSaving={addressModal.isSaving}
          hasSearchedAddress={addressModal.hasSearchedAddress}
          onClose={handleCloseAddressModal}
          onAddressQueryChange={addressModal.setAddressQuery}
          onSearch={addressModal.handleSearch}
          onSelectAddress={addressModal.handleSelectAddress}
          onAddressAliasChange={addressModal.setAddressAlias}
          onAddAddress={addressModal.handleAddAddress}
          onClearSelection={() => {
            addressModal.setSelectedAddress(null);
            addressModal.setAddressAlias('');
          }}
        />

        {/* Confirm default address modal */}
        {confirmModalAnimation.shouldRender && addressList.confirmDefaultAddress && createPortal(
          <div
            className={[
              'fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm',
              `z-[${Z_INDEX.PRIORITY_MODAL}]`,
              confirmModalAnimation.isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit',
            ].join(' ')}
          >
            <div
              className={[
                'relative w-full max-w-md rounded-[32px] border border-border-default bg-bg-surface p-8 shadow-2xl',
                confirmModalAnimation.isAnimating ? 'modal-content-enter' : 'modal-content-exit',
              ].join(' ')}
            >
              <h2 className="mb-4 text-xl font-bold text-text-primary">
                {t('user.setDefaultAddress')}
              </h2>
              <p className="mb-6 text-text-secondary">
                <span className="font-semibold text-brand-primary">
                  {addressList.confirmDefaultAddress.alias
                    ? `${addressList.confirmDefaultAddress.alias} - `
                    : ''}
                  {addressList.confirmDefaultAddress.roadAddress}
                </span>
                {t('user.setDefaultAddressMessage')}
              </p>
              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => addressList.setConfirmDefaultAddress(null)}
                  className="flex-1 border border-border-default bg-bg-primary text-text-secondary hover:bg-bg-hover"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  size="lg"
                  onClick={addressList.handleConfirmSetDefault}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 text-text-inverse shadow-md shadow-orange-500/30"
                >
                  {t('common.confirm')}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </PageContainer>
  );
}
