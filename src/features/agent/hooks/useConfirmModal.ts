import { useAppSelector } from '@app/store/hooks';
import { useModalScrollLock } from '@shared/hooks/useModalScrollLock';
import { useEscapeKey } from '@shared/hooks/useEscapeKey';

interface UseConfirmModalProps {
  handleCancel: () => void;
}

export function useConfirmModal({ handleCancel }: UseConfirmModalProps) {
  const showConfirmCard = useAppSelector((state) => state.agent.showConfirmCard);
  const menuRequestAddress = useAppSelector((state) => state.agent.menuRequestAddress);

  // 모달 열릴 때 배경 스크롤 잠금
  useModalScrollLock(showConfirmCard);
  useEscapeKey(handleCancel, showConfirmCard);

  return {
    showConfirmCard,
    menuRequestAddress,
  };
}
