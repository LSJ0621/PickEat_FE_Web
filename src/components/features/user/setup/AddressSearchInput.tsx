/**
 * 주소 검색 입력 컴포넌트
 * 주소 검색 입력 필드와 검색 버튼을 제공합니다.
 */

import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

interface AddressSearchInputProps {
  addressQuery: string;
  isSearching: boolean;
  onAddressQueryChange: (query: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

export const AddressSearchInput = ({
  addressQuery,
  isSearching,
  onAddressQueryChange,
  onSearch,
  placeholder,
}: AddressSearchInputProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        value={addressQuery}
        onChange={(e) => onAddressQueryChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !isSearching) {
            onSearch();
          }
        }}
        placeholder={placeholder || t('setup.address.searchPlaceholder')}
        aria-label={t('setup.address.search')}
        className="flex-1 rounded-xl border-border-default bg-bg-secondary
          text-text-primary placeholder-text-placeholder
          focus-visible:ring-brand-primary/40 focus-visible:border-border-focus
          h-11"
      />
      <Button
        onClick={onSearch}
        isLoading={isSearching}
        size="md"
        aria-label={t('setup.search')}
      >
        {t('setup.search')}
      </Button>
    </div>
  );
};
