import { useTranslation } from 'react-i18next';
import { MapPin, ChevronRight } from 'lucide-react';
import type { UserAddress } from '@/types/user';

interface AddressSectionProps {
  userAddress: string | null | undefined;
  addresses?: UserAddress[];
  onManageClick: () => void;
}

export const AddressSection = ({ userAddress, onManageClick }: AddressSectionProps) => {
  const { t } = useTranslation();

  return (
    <button
      data-testid="address-section"
      onClick={onManageClick}
      className="group w-full p-4 row-interactive text-left"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-green-50">
          <MapPin className="h-5 w-5 text-green-500" />
        </div>
        <div className="flex flex-1 items-center justify-between">
          <span className="text-sm text-text-primary">{t('user.address.title')}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary text-right max-w-[200px] truncate">
              {userAddress || t('user.address.noAddress')}
            </span>
            <ChevronRight className="h-4 w-4 text-text-tertiary icon-chevron-hover" />
          </div>
        </div>
      </div>
    </button>
  );
};
