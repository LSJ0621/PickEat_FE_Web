/**
 * 유저 가게 상세 정보 모달
 */

import type { AdminUserPlaceListItem, UpdateUserPlaceByAdminRequest } from '@/types/admin';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Z_INDEX } from '@/utils/constants';
import { useToast } from '@/hooks/common/useToast';
import { UserPlaceImageUploader } from '@/components/features/user-place/UserPlaceImageUploader';

interface UserPlaceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: AdminUserPlaceListItem | null;
  onApprove: (id: number) => void;
  onReject: (id: number, reason: string) => void;
  onUpdate?: (id: number, data: UpdateUserPlaceByAdminRequest) => void;
  approving?: boolean;
  rejecting?: boolean;
  isUpdating?: boolean;
}

export function UserPlaceDetailModal({
  isOpen,
  onClose,
  place,
  onApprove,
  onReject,
  onUpdate,
  approving = false,
  rejecting = false,
  isUpdating = false,
}: UserPlaceDetailModalProps) {
  const { t } = useTranslation();
  const { error: showError } = useToast();
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    openingHours: '',
    category: '',
    description: '',
    existingPhotos: [] as string[],
    newImages: [] as File[],
  });

  // Animation lifecycle
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  // Scroll reset when modal opens
  useEffect(() => {
    if (isOpen && modalContentRef.current) {
      const timer = setTimeout(() => {
        if (modalContentRef.current) {
          modalContentRef.current.scrollTop = 0;
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Reset form state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedAction(null);
      setRejectReason('');
      setRejectError('');
      setIsEditing(false);
    }
  }, [isOpen]);

  // Initialize edit form when place changes or entering edit mode
  useEffect(() => {
    if (place && isEditing) {
      setEditForm({
        name: place.name || '',
        address: place.address || '',
        phoneNumber: place.phoneNumber || '',
        openingHours: place.openingHours || '',
        category: place.category || '',
        description: place.description || '',
        existingPhotos: place.photos || [],
        newImages: [],
      });
    }
  }, [place, isEditing]);

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!shouldRender || !place) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmit = () => {
    if (selectedAction === 'approve') {
      onApprove(place.id);
    } else if (selectedAction === 'reject') {
      if (rejectReason.trim().length < 10) {
        setRejectError(t('admin.userPlaces.detail.rejectionReasonMinLength'));
        return;
      }
      onReject(place.id, rejectReason.trim());
    }
  };

  const handleEditSave = () => {
    if (!onUpdate || !place) return;

    // Validate required fields
    const trimmedName = editForm.name.trim();
    const trimmedAddress = editForm.address.trim();

    if (!trimmedName) {
      showError('Name is required');
      return;
    }
    if (!trimmedAddress) {
      showError('Address is required');
      return;
    }

    // Validate field lengths
    if (trimmedName.length > 100) {
      showError('Name must be 100 characters or less');
      return;
    }
    if (trimmedAddress.length > 500) {
      showError('Address must be 500 characters or less');
      return;
    }

    const updateData: {
      name?: string;
      address?: string;
      phoneNumber?: string;
      openingHours?: string;
      category?: string;
      description?: string;
      existingPhotos?: string[];
      images?: File[];
    } = {};

    const placePhotos = place.photos || [];

    // Only include changed fields
    if (trimmedName !== place.name) updateData.name = trimmedName;
    if (trimmedAddress !== place.address) updateData.address = trimmedAddress;
    if (editForm.phoneNumber.trim() !== (place.phoneNumber || '')) {
      updateData.phoneNumber = editForm.phoneNumber.trim() || undefined;
    }
    if (editForm.openingHours.trim() !== (place.openingHours || '')) {
      updateData.openingHours = editForm.openingHours.trim() || undefined;
    }
    if (editForm.category.trim() !== (place.category || '')) {
      updateData.category = editForm.category.trim() || undefined;
    }
    if (editForm.description.trim() !== (place.description || '')) {
      updateData.description = editForm.description.trim() || undefined;
    }

    // 새 이미지가 있거나 기존 사진이 변경된 경우 existingPhotos 항상 포함
    const photosChanged = JSON.stringify(editForm.existingPhotos) !== JSON.stringify(placePhotos);
    const hasNewImages = editForm.newImages.length > 0;

    if (photosChanged || hasNewImages) {
      updateData.existingPhotos = editForm.existingPhotos;
    }
    if (hasNewImages) {
      updateData.images = editForm.newImages;
    }

    // Check if any changes were made
    if (Object.keys(updateData).length === 0) {
      setIsEditing(false);
      return;
    }

    onUpdate(place.id, updateData);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    if (place) {
      setEditForm({
        name: place.name || '',
        address: place.address || '',
        phoneNumber: place.phoneNumber || '',
        openingHours: place.openingHours || '',
        category: place.category || '',
        description: place.description || '',
        existingPhotos: place.photos || [],
        newImages: [],
      });
    }
  };

  const getStatusBadge = (status: AdminUserPlaceListItem['status']) => {
    const badges = {
      PENDING: { label: t('admin.userPlaces.status.pending'), bg: 'bg-warning-bg', text: 'text-warning' },
      APPROVED: { label: t('admin.userPlaces.status.approved'), bg: 'bg-success-bg', text: 'text-success' },
      REJECTED: { label: t('admin.userPlaces.status.rejected'), bg: 'bg-error-bg', text: 'text-error' },
    };

    const badge = badges[status];
    return (
      <span className={`rounded-full ${badge.bg} px-3 py-1 text-sm font-medium ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const modalContent = (
    <>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
          isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
        }`}
        style={{ zIndex: Z_INDEX.PRIORITY_MODAL }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/70" onClick={onClose} />

        {/* Modal */}
        <div
          ref={modalContentRef}
          className={`relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-[var(--border-default)] bg-bg-surface p-6 shadow-xl custom-scroll ${
            isAnimating ? 'modal-content-enter' : 'modal-content-exit'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div className="flex-1">
              <h2 className="mb-2 text-2xl font-bold text-text-primary">{place.name}</h2>
              {getStatusBadge(place.status)}
            </div>
            <button
              onClick={onClose}
              className="text-text-tertiary transition hover:text-text-primary"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Edit Button (APPROVED status only) */}
            {place.status === 'APPROVED' && !isEditing && (
              <div className="flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Edit
                </button>
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-3 rounded-lg border border-[var(--border-default)] bg-bg-surface p-4">
              <div>
                <div className="text-sm text-text-tertiary">이름</div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-default)] bg-bg-surface px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                ) : (
                  <div className="text-text-primary">{place.name}</div>
                )}
              </div>
              <div>
                <div className="text-sm text-text-tertiary">주소</div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-default)] bg-bg-surface px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                ) : (
                  <div className="text-text-primary">{place.address}</div>
                )}
              </div>
              <div>
                <div className="text-sm text-text-tertiary">카테고리</div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-default)] bg-bg-surface px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                ) : (
                  <div className="text-text-primary">{place.category}</div>
                )}
              </div>
              {/* 메뉴 종류 */}
              {!isEditing && place.menuTypes && place.menuTypes.length > 0 && (
                <div>
                  <div className="text-sm text-text-tertiary">메뉴 종류</div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {place.menuTypes.map((menu, idx) => (
                      <span key={idx} className="rounded-full bg-brand-tertiary border border-brand-primary/20 px-2.5 py-0.5 text-sm font-medium text-brand-primary">
                        {menu}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm text-text-tertiary">전화번호</div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-default)] bg-bg-surface px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    placeholder="전화번호를 입력하세요"
                  />
                ) : (
                  <div className="text-text-primary">{place.phoneNumber || '-'}</div>
                )}
              </div>
              <div>
                <div className="text-sm text-text-tertiary">영업시간</div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.openingHours}
                    onChange={(e) => setEditForm({ ...editForm, openingHours: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-default)] bg-bg-surface px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    placeholder="영업시간을 입력하세요"
                  />
                ) : (
                  <div className="text-text-primary">{place.openingHours || '-'}</div>
                )}
              </div>
              <div>
                <div className="text-sm text-text-tertiary">설명</div>
                {isEditing ? (
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-default)] bg-bg-surface px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    placeholder="설명을 입력하세요"
                    rows={3}
                  />
                ) : (
                  <div className="text-text-primary">{place.description || '-'}</div>
                )}
              </div>
              {isEditing && (
                <div>
                  <div className="text-sm text-text-tertiary mb-2">사진</div>
                  <UserPlaceImageUploader
                    existingPhotos={editForm.existingPhotos}
                    newImages={editForm.newImages}
                    onExistingRemove={(url) =>
                      setEditForm({
                        ...editForm,
                        existingPhotos: editForm.existingPhotos.filter((p) => p !== url),
                      })
                    }
                    onNewAdd={(files) =>
                      setEditForm({
                        ...editForm,
                        newImages: [...editForm.newImages, ...files],
                      })
                    }
                    onNewRemove={(index) =>
                      setEditForm({
                        ...editForm,
                        newImages: editForm.newImages.filter((_, i) => i !== index),
                      })
                    }
                  />
                </div>
              )}
              {/* 사진 - 비편집 모드 */}
              {!isEditing && place.photos && place.photos.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-text-tertiary">
                    사진
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {place.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`${place.name} ${idx + 1}`}
                        className="h-20 w-20 rounded-lg object-cover transition-opacity duration-normal"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm text-text-tertiary">등록자</div>
                <div className="text-text-primary">{place.user.email}</div>
              </div>
            </div>

            {/* Status Info */}
            <div className="space-y-3 rounded-lg border border-[var(--border-default)] bg-bg-surface p-4">
              <div>
                <div className="text-sm text-text-tertiary">등록일</div>
                <div className="text-text-primary">{formatDate(place.createdAt)}</div>
              </div>
              <div>
                <div className="text-sm text-text-tertiary">수정일</div>
                <div className="text-text-primary">{formatDate(place.updatedAt)}</div>
              </div>
              {place.rejectionCount > 0 && (
                <div>
                  <div className="text-sm text-text-tertiary">
                    {t('admin.userPlaces.detail.rejectionCount')}
                  </div>
                  <div className="text-brand-primary">{place.rejectionCount}회</div>
                </div>
              )}
              {place.lastRejectedAt && (
                <div>
                  <div className="text-sm text-text-tertiary">마지막 거절 일시</div>
                  <div className="text-text-primary">{formatDate(place.lastRejectedAt)}</div>
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
                <button
                  onClick={handleEditCancel}
                  disabled={isUpdating}
                  className="flex-1 rounded-lg border border-[var(--border-default)] bg-bg-surface px-4 py-3 font-medium text-text-primary transition hover:bg-bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={isUpdating}
                  className="flex-1 rounded-lg bg-brand-primary px-4 py-3 font-medium text-white transition hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? t('common.processing') || '처리 중...' : 'Save'}
                </button>
              </div>
            )}

            {/* Actions */}
            {place.status === 'PENDING' && !isEditing && (
              <div className="space-y-4">
                {/* Radio Button Group */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-text-secondary">
                    {t('admin.userPlaces.detail.selectAction')}
                  </label>
                  <div className="flex gap-4">
                    <label htmlFor="action-approve" className="flex items-center gap-2 cursor-pointer">
                      <input
                        id="action-approve"
                        type="radio"
                        name="action"
                        value="approve"
                        checked={selectedAction === 'approve'}
                        onChange={() => {
                          setSelectedAction('approve');
                          setRejectError('');
                        }}
                        className="h-4 w-4 text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-text-primary">{t('admin.userPlaces.detail.approve')}</span>
                    </label>
                    <label htmlFor="action-reject" className="flex items-center gap-2 cursor-pointer">
                      <input
                        id="action-reject"
                        type="radio"
                        name="action"
                        value="reject"
                        checked={selectedAction === 'reject'}
                        onChange={() => setSelectedAction('reject')}
                        className="h-4 w-4 text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-text-primary">{t('admin.userPlaces.detail.reject')}</span>
                    </label>
                  </div>
                </div>

                {/* Rejection Reason Input (shown only when reject is selected) */}
                {selectedAction === 'reject' && (
                  <div className="rounded-lg border border-[var(--border-default)] bg-bg-surface p-4 space-y-3">
                    <label className="block text-sm font-medium text-text-secondary">
                      {t('admin.userPlaces.detail.rejectionReason')} (필수)
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => {
                        setRejectReason(e.target.value);
                        if (rejectError) setRejectError('');
                      }}
                      placeholder={t('admin.userPlaces.detail.rejectionReasonPlaceholder')}
                      className="w-full rounded-lg border border-[var(--border-default)] bg-bg-surface px-4 py-3 text-text-primary placeholder-text-placeholder focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                      rows={4}
                      maxLength={500}
                    />
                    {rejectError && (
                      <p className="text-sm text-error">{rejectError}</p>
                    )}
                    <div className="text-xs text-text-tertiary text-right">
                      {rejectReason.length}/500
                    </div>
                  </div>
                )}

                {/* Confirm Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!selectedAction || approving || rejecting}
                  className="w-full rounded-lg bg-brand-primary px-4 py-3 font-medium text-white transition hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {approving || rejecting ? t('common.processing') || '처리 중...' : t('common.confirm')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
