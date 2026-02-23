/**
 * User Place 상세 정보 모달
 * 모바일: Bottom Sheet / 데스크탑: Dialog
 */

import { Button } from '@shared/components/Button';
import { ModalCloseButton } from '@shared/components/ModalCloseButton';
import { Badge } from '@shared/ui/badge';
import { useModalAnimation } from '@shared/hooks/useModalAnimation';
import { useModalScrollLock } from '@shared/hooks/useModalScrollLock';
import type { UserPlace } from '@features/user-place/types';
import { Z_INDEX } from '@shared/utils/constants';
import { MapPin, Phone, Tag, Clock, Image } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlaceStatusBadge } from './UserPlaceStatusBadge';

interface UserPlaceDetailModalProps {
  open: boolean;
  place: UserPlace | null;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function UserPlaceDetailModal({
  open,
  place,
  onClose,
  onEdit,
  onDelete,
}: UserPlaceDetailModalProps) {
  const { t } = useTranslation();
  const { isAnimating, shouldRender } = useModalAnimation(open && !!place);
  useModalScrollLock(open && !!place);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!shouldRender || !place) return null;

  const canEdit = place.status === 'PENDING' || place.status === 'REJECTED';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={place.name}
      style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
      className={[
        'fixed inset-0 flex items-end bg-black/40 backdrop-blur-sm sm:items-center sm:p-4',
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit',
      ].join(' ')}
      onClick={onClose}
    >
      <div
        style={{ zIndex: Z_INDEX.MODAL_CONTENT }}
        className={[
          'relative w-full max-h-[92vh] overflow-y-auto',
          'rounded-t-2xl border border-border-default bg-bg-surface p-6 shadow-2xl',
          'sm:mx-auto sm:max-w-2xl sm:rounded-2xl sm:p-8',
          isAnimating ? 'modal-content-enter' : 'modal-content-exit',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalCloseButton onClose={onClose} />

        {/* 제목 + 상태 */}
        <div className="mb-6 pr-10">
          <div className="mb-2 flex flex-wrap items-start gap-2">
            <h2 className="text-xl font-bold text-text-primary sm:text-2xl">{place.name}</h2>
            <UserPlaceStatusBadge status={place.status} />
          </div>
        </div>

        <div className="space-y-4">
          {/* 주소 */}
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
            <div>
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                {t('userPlace.address')}
              </p>
              <p className="text-sm text-text-primary">{place.address}</p>
            </div>
          </div>

          {/* 전화번호 */}
          {place.phoneNumber && (
            <div className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
              <div>
                <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  {t('userPlace.phoneNumber')}
                </p>
                <p className="text-sm text-text-primary">{place.phoneNumber}</p>
              </div>
            </div>
          )}

          {/* 카테고리 */}
          {place.category && (
            <div className="flex items-start gap-2">
              <Tag className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
              <div>
                <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  {t('userPlace.category')}
                </p>
                <p className="text-sm text-text-primary">{place.category}</p>
              </div>
            </div>
          )}

          {/* 설명 */}
          {place.description && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                {t('userPlace.description')}
              </p>
              <p className="text-sm text-text-primary">{place.description}</p>
            </div>
          )}

          {/* 메뉴 종류 */}
          {place.menuTypes && place.menuTypes.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                {t('userPlace.form.menuTypes')}
              </p>
              <div className="flex flex-wrap gap-2">
                {place.menuTypes.map((menu, idx) => (
                  <Badge key={idx} variant="menu">{menu}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* 영업시간 */}
          {place.openingHours && (
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
              <div>
                <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  {t('userPlace.form.openingHours')}
                </p>
                <p className="whitespace-pre-line text-sm text-text-primary">{place.openingHours}</p>
              </div>
            </div>
          )}

          {/* 사진 갤러리 */}
          {place.photos && place.photos.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Image className="h-4 w-4 text-text-tertiary" />
                <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  {t('userPlace.form.photos')}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {place.photos.map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`${place.name} ${idx + 1}`}
                    className="h-20 w-full rounded-2xl object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          {/* 거절 사유 */}
          {place.status === 'REJECTED' && place.rejectionReason && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="mb-1 text-sm font-semibold text-red-300">
                {t('userPlace.rejectionReason')}
              </p>
              <p className="text-sm text-red-200">{place.rejectionReason}</p>
            </div>
          )}

          {/* 등록일시 */}
          <div className="grid grid-cols-2 gap-4 border-t border-border-default pt-4 text-xs">
            <div>
              <p className="mb-1 text-text-tertiary">{t('userPlace.createdAt')}</p>
              <p className="text-text-secondary">{new Date(place.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="mb-1 text-text-tertiary">{t('userPlace.updatedAt')}</p>
              <p className="text-text-secondary">{new Date(place.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        {canEdit && (onEdit || onDelete) && (
          <div className="mt-6 flex gap-3">
            {onEdit && (
              <Button variant="ghost" className="flex-1" onClick={onEdit}>
                {t('common.edit')}
              </Button>
            )}
            {onDelete && (
              <Button
                variant="primary"
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600"
                onClick={onDelete}
              >
                {t('common.delete')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
