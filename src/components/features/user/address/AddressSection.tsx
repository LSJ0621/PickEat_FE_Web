import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';
import type { UserAddress } from '@/types/user';

interface AddressSectionProps {
  userAddress: string | null | undefined;
  addresses: UserAddress[];
  onManageClick: () => void;
}

export const AddressSection = ({ userAddress, addresses, onManageClick }: AddressSectionProps) => {
  const { t } = useTranslation();

  return (
    <div data-testid="address-section" className="rounded-[32px] border border-border-default bg-bg-surface p-6 shadow-2xl shadow-black/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
            {t('user.address.title')}
          </p>
          {userAddress ? (
            <div className="mt-3">
              <p className="truncate text-base font-semibold text-text-primary">{userAddress}</p>
              {addresses.length > 1 && (
                <p className="mt-1 text-xs text-text-tertiary">
                  {t('user.address.addressCount', { count: addresses.length })}
                </p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-text-tertiary">{t('user.address.noAddress')}</p>
          )}
        </div>
        <Button
          size="sm"
          className="shrink-0 bg-gradient-to-r from-brand-primary to-rose-500 px-5 text-text-inverse shadow-md shadow-brand-primary/30"
          onClick={onManageClick}
          aria-label={t('user.address.manage')}
        >
          {t('user.address.manage')}
        </Button>
      </div>
    </div>
  );
};
