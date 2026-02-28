/**
 * MyAddressPage - 주소 관리 페이지
 * 주소 목록을 페이지에 직접 렌더링합니다.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '@shared/components/PageContainer';
import { PageHeader } from '@shared/components/PageHeader';
import { Button } from '@shared/components/Button';
import { ConfirmDialog } from '@shared/components/ConfirmDialog';
import { AddressAddModal } from '@features/user/components/address/AddressAddModal';
import { useAddressList } from '@shared/hooks/address/useAddressList';
import { useAddressModal } from '@shared/hooks/address/useAddressModal';
import { ADDRESS } from '@shared/utils/constants';
import { Card, CardContent } from '@shared/ui/card';
import { Badge } from '@shared/ui/badge';
import { Checkbox } from '@shared/ui/checkbox';
import { Skeleton } from '@shared/ui/skeleton';

export function MyAddressPage() {
  const { t } = useTranslation();

  const [showAddressModal, setShowAddressModal] = useState(false);

  const addressList = useAddressList();
  const addressModal = useAddressModal({
    addressesCount: addressList.addresses.length,
    onAddressAdded: addressList.loadAddresses,
  });

  // Load addresses on mount
  useEffect(() => {
    addressList.loadAddresses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenAddModal = () => {
    addressModal.resetAddressModal();
    setShowAddressModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddressModal(false);
    addressModal.resetAddressModal();
  };

  const editToggleAction = addressList.addresses.length > 0 ? (
    <Button
      size="sm"
      variant="ghost"
      onClick={addressList.toggleEditMode}
      className="border border-border-default bg-bg-secondary text-text-primary hover:bg-bg-hover"
    >
      {addressList.isEditMode ? t('user.address.done') : t('user.address.edit')}
    </Button>
  ) : undefined;

  return (
    <PageContainer maxWidth="max-w-3xl">
      <PageHeader
        title={t('user.address.title')}
        action={editToggleAction}
      />

      {addressList.isLoadingAddresses ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-border-default">
              <CardContent className="p-4 pt-4 space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {addressList.addresses.length === 0 ? (
            <p className="py-12 text-center text-sm text-text-tertiary">
              {t('user.address.noAddresses')}
            </p>
          ) : (
            <div className="space-y-3">
              {/* Default address card */}
              {addressList.defaultAddress && (
                <Card className="border-2 border-brand-primary bg-brand-tertiary shadow-md">
                  <CardContent className="p-4 pt-4">
                    <div className="flex items-start gap-3">
                      <Badge variant="menu" className="shrink-0 mt-0.5">
                        {t('user.address.default')}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        {addressList.defaultAddress.alias && (
                          <p className="text-xs font-medium text-brand-primary mb-0.5">
                            {addressList.defaultAddress.alias}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-text-primary">
                          {addressList.defaultAddress.roadAddress}
                        </p>
                        {addressList.defaultAddress.postalCode && (
                          <p className="mt-0.5 text-xs text-text-tertiary">
                            {addressList.defaultAddress.postalCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Non-default addresses */}
              {addressList.addresses
                .filter((addr) => !addr.isDefault)
                .map((address) => {
                  const isSelected = addressList.selectedDeleteIds.includes(address.id);
                  const cardClassName = addressList.isEditMode && isSelected
                    ? 'border-2 border-destructive/50 bg-red-50 cursor-pointer transition-all'
                    : addressList.isEditMode
                    ? 'border border-border-default bg-bg-surface cursor-pointer hover:bg-bg-hover transition-all'
                    : 'border border-border-default bg-bg-surface hover:border-brand-secondary hover:shadow-sm transition-all cursor-pointer';

                  return (
                    <Card
                      key={address.id}
                      className={cardClassName}
                      onClick={() => {
                        if (!addressList.isEditMode) {
                          addressList.handleAddressClick(address);
                        }
                      }}
                    >
                      <CardContent className="p-4 pt-4">
                        <div className="flex items-start gap-3">
                          {addressList.isEditMode && (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => addressList.handleToggleDeleteSelection(address.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            {address.alias && (
                              <p className="text-xs font-medium text-text-secondary mb-0.5">
                                {address.alias}
                              </p>
                            )}
                            <p className="text-sm font-medium text-text-primary">
                              {address.roadAddress}
                            </p>
                            {address.postalCode && (
                              <p className="mt-0.5 text-xs text-text-tertiary">
                                {address.postalCode}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}

          {/* Bottom actions */}
          {addressList.isEditMode ? (
            addressList.selectedDeleteIds.length > 0 && (
              <Button
                size="lg"
                variant="primary"
                onClick={() => addressList.handleDeleteAddresses(addressList.selectedDeleteIds)}
                className="w-full mt-4 bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-500/30"
              >
                {t('user.address.deleteSelected', { count: addressList.selectedDeleteIds.length })}
              </Button>
            )
          ) : (
            <>
              {addressList.addresses.length < ADDRESS.MAX_ADDRESS_COUNT && (
                <Card
                  className="mt-4 border-2 border-dashed border-border-default hover:border-brand-primary/50 cursor-pointer transition-colors"
                  onClick={handleOpenAddModal}
                  data-testid="address-page-add-button"
                >
                  <CardContent className="p-3 pt-3 text-center">
                    <span className="text-sm font-medium text-text-tertiary hover:text-brand-primary transition-colors">
                      {t('user.address.addAddress', {
                        current: addressList.addresses.length,
                        max: ADDRESS.MAX_ADDRESS_COUNT,
                      })}
                    </span>
                  </CardContent>
                </Card>
              )}

              {addressList.addresses.length >= ADDRESS.MAX_ADDRESS_COUNT && (
                <p className="text-center text-sm text-text-tertiary mt-4">
                  {t('user.address.maxAddresses', { max: ADDRESS.MAX_ADDRESS_COUNT })}
                </p>
              )}
            </>
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={addressList.confirmDeleteIds !== null}
        title={t('user.address.deleteConfirmTitle')}
        message={t('errors.address.confirmDelete', {
          count: addressList.confirmDeleteIds?.length ?? 0,
        })}
        onConfirm={addressList.handleConfirmDelete}
        onCancel={addressList.handleCancelDelete}
        variant="danger"
      />

      {/* Set default address confirmation dialog */}
      <ConfirmDialog
        open={!!addressList.confirmDefaultAddress}
        title={t('user.setDefaultAddress')}
        message={`"${addressList.confirmDefaultAddress?.alias ? `${addressList.confirmDefaultAddress.alias} - ` : ''}${addressList.confirmDefaultAddress?.roadAddress ?? ''}"${t('user.setDefaultAddressMessage')}`}
        onConfirm={addressList.handleConfirmSetDefault}
        onCancel={addressList.handleCancelSetDefault}
      />

      {/* Add address modal */}
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
        onClose={handleCloseAddModal}
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
    </PageContainer>
  );
}
