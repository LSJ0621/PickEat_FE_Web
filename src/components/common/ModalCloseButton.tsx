/**
 * 모달 닫기 버튼 컴포넌트
 * 모든 모달에서 공통으로 사용하는 닫기 버튼
 */

import { useTranslation } from 'react-i18next';

interface ModalCloseButtonProps {
  onClose: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
}

export const ModalCloseButton = ({
  onClose,
  className = '',
  size = 'md',
  ariaLabel,
}: ModalCloseButtonProps) => {
  const { t } = useTranslation();
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  };

  return (
    <button
      data-testid="modal-close-button"
      onClick={onClose}
      className={`absolute right-6 top-6 text-slate-400 transition hover:text-white ${className}`}
      aria-label={ariaLabel || t('common.close')}
    >
      <svg className={sizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
};

