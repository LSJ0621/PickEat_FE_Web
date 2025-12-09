import { Button } from '@/components/common/Button';
import type { UserAddress } from '@/types/user';

interface AddressSectionProps {
  userAddress: string | null | undefined;
  addresses: UserAddress[];
  onManageClick: () => void;
}

export const AddressSection = ({ userAddress, addresses, onManageClick }: AddressSectionProps) => {
  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-slate-400">주소 관리</p>
          {userAddress ? (
            <div className="mt-2">
              <p className="text-lg font-semibold text-white">{userAddress}</p>
              {addresses.length > 1 && (
                <p className="mt-1 text-xs text-slate-400">
                  총 {addresses.length}개의 주소가 등록되어 있습니다
                </p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">주소가 등록되지 않았습니다.</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            className="bg-gradient-to-r from-orange-500 to-rose-500 px-5 text-white shadow-md shadow-orange-500/30"
            onClick={onManageClick}
          >
            주소 관리
          </Button>
        </div>
      </div>
    </div>
  );
};

