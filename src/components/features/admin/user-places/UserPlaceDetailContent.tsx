/**
 * 유저 가게 상세 모달 콘텐츠 컴포넌트
 * 보기 모드와 편집 모드의 UI 렌더링을 담당합니다.
 */

import type { AdminUserPlaceListItem } from '@/types/admin';
import { useTranslation } from 'react-i18next';
import { formatDateTimeKorean } from '@/utils/format';
import { UserPlaceImageUploader } from '@/components/features/user-place/UserPlaceImageUploader';

export interface EditFormState {
  name: string;
  address: string;
  phoneNumber: string;
  openingHours: string;
  category: string;
  description: string;
  existingPhotos: string[];
  newImages: File[];
}

interface UserPlaceDetailContentProps {
  place: AdminUserPlaceListItem;
  isEditing: boolean;
  editForm: EditFormState;
  isUpdating: boolean;
  approving: boolean;
  rejecting: boolean;
  selectedAction: 'approve' | 'reject' | null;
  rejectReason: string;
  rejectError: string;
  onSetIsEditing: (value: boolean) => void;
  onEditFormChange: (form: EditFormState) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onSetSelectedAction: (action: 'approve' | 'reject') => void;
  onSetRejectReason: (reason: string) => void;
  onSetRejectError: (error: string) => void;
  onSubmit: () => void;
}

const INPUT_CLASS =
  'w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand-primary/20';

interface BasicInfoPanelProps {
  place: AdminUserPlaceListItem;
  isEditing: boolean;
  editForm: EditFormState;
  onEditFormChange: (form: EditFormState) => void;
}

function BasicInfoPanel({ place, isEditing, editForm, onEditFormChange }: BasicInfoPanelProps) {
  return (
    <div className="space-y-3 rounded-lg border border-border-default bg-bg-primary p-4">
      <div>
        <div className="text-sm text-text-tertiary">이름</div>
        {isEditing ? (
          <input type="text" value={editForm.name} onChange={(e) => onEditFormChange({ ...editForm, name: e.target.value })} className={INPUT_CLASS} />
        ) : (
          <div className="text-text-primary">{place.name}</div>
        )}
      </div>
      <div>
        <div className="text-sm text-text-tertiary">주소</div>
        {isEditing ? (
          <input type="text" value={editForm.address} onChange={(e) => onEditFormChange({ ...editForm, address: e.target.value })} className={INPUT_CLASS} />
        ) : (
          <div className="text-text-primary">{place.address}</div>
        )}
      </div>
      <div>
        <div className="text-sm text-text-tertiary">카테고리</div>
        {isEditing ? (
          <input type="text" value={editForm.category} onChange={(e) => onEditFormChange({ ...editForm, category: e.target.value })} className={INPUT_CLASS} />
        ) : (
          <div className="text-text-primary">{place.category}</div>
        )}
      </div>
      <div>
        <div className="text-sm text-text-tertiary">전화번호</div>
        {isEditing ? (
          <input type="text" value={editForm.phoneNumber} onChange={(e) => onEditFormChange({ ...editForm, phoneNumber: e.target.value })} className={INPUT_CLASS} placeholder="전화번호를 입력하세요" />
        ) : (
          <div className="text-text-primary">{place.phoneNumber || '-'}</div>
        )}
      </div>
      <div>
        <div className="text-sm text-text-tertiary">영업시간</div>
        {isEditing ? (
          <input type="text" value={editForm.openingHours} onChange={(e) => onEditFormChange({ ...editForm, openingHours: e.target.value })} className={INPUT_CLASS} placeholder="영업시간을 입력하세요" />
        ) : (
          <div className="text-text-primary">{place.openingHours || '-'}</div>
        )}
      </div>
      <div>
        <div className="text-sm text-text-tertiary">설명</div>
        {isEditing ? (
          <textarea value={editForm.description} onChange={(e) => onEditFormChange({ ...editForm, description: e.target.value })} className={INPUT_CLASS} placeholder="설명을 입력하세요" rows={3} />
        ) : (
          <div className="text-text-primary">{place.description || '-'}</div>
        )}
      </div>
      {isEditing && (
        <div>
          <div className="mb-2 text-sm text-text-tertiary">사진</div>
          <UserPlaceImageUploader
            existingPhotos={editForm.existingPhotos}
            newImages={editForm.newImages}
            onExistingRemove={(url) => onEditFormChange({ ...editForm, existingPhotos: editForm.existingPhotos.filter((p) => p !== url) })}
            onNewAdd={(files) => onEditFormChange({ ...editForm, newImages: [...editForm.newImages, ...files] })}
            onNewRemove={(index) => onEditFormChange({ ...editForm, newImages: editForm.newImages.filter((_, i) => i !== index) })}
          />
        </div>
      )}
      {!isEditing && place.photos && place.photos.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-text-tertiary">사진</h3>
          <div className="grid grid-cols-3 gap-2">
            {place.photos.map((photo, idx) => (
              <img key={idx} src={photo} alt={`${place.name} ${idx + 1}`} className="h-20 w-20 rounded-lg object-cover" />
            ))}
          </div>
        </div>
      )}
      <div>
        <div className="text-sm text-text-tertiary">등록자</div>
        <div className="text-text-primary">{place.user.email}</div>
      </div>
    </div>
  );
}

export function UserPlaceDetailContent({
  place,
  isEditing,
  editForm,
  isUpdating,
  approving,
  rejecting,
  selectedAction,
  rejectReason,
  rejectError,
  onSetIsEditing,
  onEditFormChange,
  onEditSave,
  onEditCancel,
  onSetSelectedAction,
  onSetRejectReason,
  onSetRejectError,
  onSubmit,
}: UserPlaceDetailContentProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Edit Button (APPROVED status only) */}
      {place.status === 'APPROVED' && !isEditing && (
        <div className="flex justify-end">
          <button
            onClick={() => onSetIsEditing(true)}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-text-inverse transition hover:bg-brand-secondary"
          >
            Edit
          </button>
        </div>
      )}

      <BasicInfoPanel place={place} isEditing={isEditing} editForm={editForm} onEditFormChange={onEditFormChange} />

      {/* Status Info */}
      <div className="space-y-3 rounded-lg border border-border-default bg-bg-primary p-4">
        <div>
          <div className="text-sm text-text-tertiary">등록일</div>
          <div className="text-text-primary">{formatDateTimeKorean(place.createdAt)}</div>
        </div>
        <div>
          <div className="text-sm text-text-tertiary">수정일</div>
          <div className="text-text-primary">{formatDateTimeKorean(place.updatedAt)}</div>
        </div>
        {place.rejectionCount > 0 && (
          <div>
            <div className="text-sm text-text-tertiary">{t('admin.userPlaces.detail.rejectionCount')}</div>
            <div className="text-brand-primary">{place.rejectionCount}회</div>
          </div>
        )}
        {place.lastRejectedAt && (
          <div>
            <div className="text-sm text-text-tertiary">마지막 거절 일시</div>
            <div className="text-text-primary">{formatDateTimeKorean(place.lastRejectedAt)}</div>
          </div>
        )}
        {place.rejectionReason && (
          <div>
            <div className="text-sm text-text-tertiary">거절 사유</div>
            <div className="text-text-primary">{place.rejectionReason}</div>
          </div>
        )}
      </div>

      {/* Edit Actions */}
      {isEditing && (
        <div className="flex gap-3">
          <button onClick={onEditCancel} disabled={isUpdating} className="flex-1 rounded-lg border border-border-default bg-bg-surface px-4 py-3 font-medium text-text-secondary transition hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onEditSave} disabled={isUpdating} className="flex-1 rounded-lg bg-brand-primary px-4 py-3 font-medium text-text-inverse transition hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-50">
            {isUpdating ? t('common.processing') || '처리 중...' : 'Save'}
          </button>
        </div>
      )}

      {/* Approval Actions (PENDING status only) */}
      {place.status === 'PENDING' && !isEditing && (
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text-secondary">
              {t('admin.userPlaces.detail.selectAction')}
            </label>
            <div className="flex gap-4">
              <label htmlFor="action-approve" className="flex cursor-pointer items-center gap-2">
                <input id="action-approve" type="radio" name="action" value="approve" checked={selectedAction === 'approve'} onChange={() => { onSetSelectedAction('approve'); onSetRejectError(''); }} className="h-4 w-4 text-brand-primary focus:ring-brand-primary" />
                <span className="text-text-primary">{t('admin.userPlaces.detail.approve')}</span>
              </label>
              <label htmlFor="action-reject" className="flex cursor-pointer items-center gap-2">
                <input id="action-reject" type="radio" name="action" value="reject" checked={selectedAction === 'reject'} onChange={() => onSetSelectedAction('reject')} className="h-4 w-4 text-brand-primary focus:ring-brand-primary" />
                <span className="text-text-primary">{t('admin.userPlaces.detail.reject')}</span>
              </label>
            </div>
          </div>
          {selectedAction === 'reject' && (
            <div className="space-y-3 rounded-lg border border-border-default bg-bg-primary p-4">
              <label className="block text-sm font-medium text-text-secondary">
                {t('admin.userPlaces.detail.rejectionReason')} (필수)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => { onSetRejectReason(e.target.value); if (rejectError) onSetRejectError(''); }}
                placeholder={t('admin.userPlaces.detail.rejectionReasonPlaceholder')}
                className="w-full rounded-lg border border-border-default bg-bg-surface px-4 py-3 text-text-primary placeholder-text-placeholder focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                rows={4}
                maxLength={500}
              />
              {rejectError && <p className="text-sm text-red-500">{rejectError}</p>}
              <div className="text-right text-xs text-text-tertiary">{rejectReason.length}/500</div>
            </div>
          )}
          <button onClick={onSubmit} disabled={!selectedAction || approving || rejecting} className="w-full rounded-lg bg-brand-primary px-4 py-3 font-medium text-text-inverse transition hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-50">
            {approving || rejecting ? t('common.processing') || '처리 중...' : t('common.confirm')}
          </button>
        </div>
      )}
    </div>
  );
}
