/**
 * User Place 삭제 확인 모달
 */

import { Button } from '@/components/common/Button';
import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import type { UserPlace } from '@/types/user-place';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

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
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(open);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!shouldRender || !place) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm ${
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
    >
      <div
        className={`relative w-full max-w-md rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl backdrop-blur ${
          isAnimating ? 'modal-content-enter' : 'modal-content-exit'
        }`}
      >
        <ModalCloseButton onClose={onClose} />

        <h2 className="mb-4 pr-12 text-2xl font-bold text-white">
          {t('common.delete')}
        </h2>

        <p className="mb-6 text-slate-300">
          {t('userPlace.confirmDelete')}
        </p>

        <div className="mb-6 rounded-lg bg-slate-800/50 p-4">
          <p className="font-semibold text-white">{place.name}</p>
          <p className="text-sm text-slate-400">{place.address}</p>
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
