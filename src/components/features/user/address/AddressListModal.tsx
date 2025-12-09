import { Button } from '@/components/common/Button';
import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import type { UserAddress } from '@/types/user';

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
  if (!open) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl backdrop-blur">
        <ModalCloseButton onClose={handleClose} />
        <div className="flex items-center justify-between mb-6 pr-12">
          <h2 className="text-2xl font-bold text-white">주소 관리</h2>
          {!isEditMode && addresses.length > 1 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEditModeChange(true)}
              className="border border-white/20 bg-white/5 text-slate-200 hover:bg-white/10"
            >
              편집
            </Button>
          )}
          {isEditMode && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEditComplete}
              className="border border-white/20 bg-white/5 text-slate-200 hover:bg-white/10"
            >
              완료
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {/* 기본주소 표시 */}
          {defaultAddr && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white font-medium">
                    {defaultAddr.alias && (
                      <span className="mr-2 text-orange-200">{defaultAddr.alias}</span>
                    )}
                    {defaultAddr.roadAddress}
                  </p>
                  {defaultAddr.postalCode && (
                    <p className="mt-1 text-xs text-slate-400">{defaultAddr.postalCode}</p>
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
                    className={`rounded-xl border p-4 transition cursor-pointer ${
                      isEditMode && selectedDeleteIds.includes(address.id)
                        ? 'border-red-500/50 bg-red-500/20'
                        : isEditMode
                        ? 'border-white/10 bg-white/5 hover:bg-white/10'
                        : 'border-white/10 bg-white/5 hover:border-orange-500/30 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
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
                            className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {address.alias && (
                              <span className="mr-2 text-orange-200">{address.alias}</span>
                            )}
                            {address.roadAddress}
                          </p>
                          {address.postalCode && (
                            <p className="mt-1 text-xs text-slate-400">{address.postalCode}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {addresses.length === 0 && (
            <p className="text-center text-slate-400 py-8">등록된 주소가 없습니다.</p>
          )}

          {/* 편집 모드에서 선택된 주소 삭제 버튼 */}
          {isEditMode && selectedDeleteIds.length > 0 && (
            <Button
              size="lg"
              variant="primary"
              onClick={() => onDeleteAddresses(selectedDeleteIds)}
              className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-500/30"
            >
              선택한 {selectedDeleteIds.length}개 주소 삭제
            </Button>
          )}

          {/* 주소 추가 버튼 */}
          {!isEditMode && addresses.length < 4 && (
            <Button
              size="lg"
              variant="primary"
              onClick={onAddAddress}
              className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/30"
            >
              + 주소 추가 ({addresses.length}/4)
            </Button>
          )}

          {!isEditMode && addresses.length >= 4 && (
            <p className="text-center text-sm text-slate-400">
              최대 4개까지 주소를 등록할 수 있습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

