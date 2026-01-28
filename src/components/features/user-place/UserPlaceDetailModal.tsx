/**
 * User Place 상세 정보 모달
 */

import { Button } from '@/components/common/Button';
import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import type { UserPlace } from '@/types/user-place';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
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

  const canEdit = place.status === 'PENDING' || place.status === 'REJECTED';

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm ${
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl backdrop-blur ${
          isAnimating ? 'modal-content-enter' : 'modal-content-exit'
        }`}
      >
        <ModalCloseButton onClose={onClose} />

        <div className="mb-6 pr-12">
          <div className="mb-3 flex items-start justify-between">
            <h2 className="text-2xl font-bold text-white">{place.name}</h2>
            <UserPlaceStatusBadge status={place.status} />
          </div>
        </div>

        <div className="space-y-4">
          {/* 주소 */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-400">
              {t('userPlace.address')}
            </h3>
            <p className="text-slate-200">{place.address}</p>
          </div>

          {/* 전화번호 */}
          {place.phoneNumber && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-400">
                {t('userPlace.phoneNumber')}
              </h3>
              <p className="text-slate-200">{place.phoneNumber}</p>
            </div>
          )}

          {/* 카테고리 */}
          {place.category && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-400">
                {t('userPlace.category')}
              </h3>
              <p className="text-slate-200">{place.category}</p>
            </div>
          )}

          {/* 설명 */}
          {place.description && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-400">
                {t('userPlace.description')}
              </h3>
              <p className="text-slate-200">{place.description}</p>
            </div>
          )}

          {/* 메뉴 종류 */}
          {place.menuTypes && place.menuTypes.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-400">
                {t('userPlace.form.menuTypes')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {place.menuTypes.map((menu, idx) => (
                  <span key={idx} className="rounded-full bg-orange-500/20 px-3 py-1 text-sm text-orange-300">
                    {menu}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 영업시간 */}
          {place.openingHours && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-400">
                {t('userPlace.form.openingHours')}
              </h3>
              <p className="whitespace-pre-line text-slate-200">{place.openingHours}</p>
            </div>
          )}

          {/* 사진 갤러리 */}
          {place.photos && place.photos.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-400">
                {t('userPlace.form.photos')}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {place.photos.map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`${place.name} ${idx + 1}`}
                    className="h-20 w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          {/* 거절 사유 */}
          {place.status === 'REJECTED' && place.rejectionReason && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
              <h3 className="mb-2 text-sm font-semibold text-red-300">
                {t('userPlace.rejectionReason')}
              </h3>
              <p className="text-red-200">{place.rejectionReason}</p>
            </div>
          )}

          {/* 등록일시 */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="mb-1 text-slate-400">{t('userPlace.createdAt')}</h3>
              <p className="text-slate-300">
                {new Date(place.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="mb-1 text-slate-400">{t('userPlace.updatedAt')}</h3>
              <p className="text-slate-300">
                {new Date(place.updatedAt).toLocaleString()}
              </p>
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
