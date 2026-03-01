/**
 * User Place 삭제 확인 모달
 */

import { Button } from '@shared/components/Button';
import { ModalCloseButton } from '@shared/components/ModalCloseButton';
import { useModalAnimation } from '@shared/hooks/useModalAnimation';
import { useModalScrollLock } from '@shared/hooks/useModalScrollLock';
import type { UserPlace } from '@features/user-place/types';
import { Z_INDEX } from '@shared/utils/constants';
import { useEscapeKey } from '@shared/hooks/useEscapeKey';
import { Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface UserPlaceDeleteConfirmProps {
  open: boolean;
  place: UserPlace | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function UserPlaceDeleteConfirm({
  open,
  place,
  isDeleting,
  onClose,
  onConfirm,
}: UserPlaceDeleteConfirmProps) {
  const { t } = useTranslation();
  const { isAnimating, shouldRender, isClosing } = useModalAnimation(open && !!place);
  useModalScrollLock(open && !!place);

  useEscapeKey(() => { if (!isDeleting) onClose(); }, open);

  if (!shouldRender || !place) return null;

  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
      className={[
        'fixed inset-0 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm',
        isAnimating ? 'modal-backdrop-enter' : isClosing ? 'modal-backdrop-exit' : 'opacity-0',
      ].join(' ')}
      onClick={() => { if (!isDeleting) onClose(); }}
    >
      <div
        style={{ zIndex: Z_INDEX.MODAL_CONTENT }}
        className={[
          'relative w-full max-w-md rounded-2xl border border-border-default bg-bg-surface p-8 shadow-2xl',
          isAnimating ? 'modal-content-enter' : isClosing ? 'modal-content-exit' : '',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalCloseButton onClose={onClose} />

        {/* 아이콘 */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15">
            <Trash2 className="h-7 w-7 text-red-400" />
          </div>
        </div>

        <h2 className="mb-2 pr-8 text-center text-xl font-bold text-text-primary">
          {t('common.delete')}
        </h2>

        <p className="mb-6 text-center text-sm text-text-secondary">
          {t('userPlace.confirmDelete')}
        </p>

        {/* 가게 정보 */}
        <div className="mb-6 rounded-2xl bg-bg-secondary p-4 text-center">
          <p className="font-semibold text-text-primary">{place.name}</p>
          <p className="mt-1 text-sm text-text-tertiary">{place.address}</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={onClose}
            disabled={isDeleting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600"
            onClick={onConfirm}
            isLoading={isDeleting}
          >
            {t('common.delete')}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
