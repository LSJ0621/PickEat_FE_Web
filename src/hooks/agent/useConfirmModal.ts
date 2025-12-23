import { useAppSelector } from '@/store/hooks';
import { useEffect } from 'react';

interface UseConfirmModalProps {
  handleCancel: () => void;
}

export function useConfirmModal({ handleCancel }: UseConfirmModalProps) {
  const showConfirmCard = useAppSelector((state) => state.agent.showConfirmCard);
  const menuRequestAddress = useAppSelector((state) => state.agent.menuRequestAddress);

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!showConfirmCard) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [showConfirmCard, handleCancel]);

  return {
    showConfirmCard,
    menuRequestAddress,
  };
}
