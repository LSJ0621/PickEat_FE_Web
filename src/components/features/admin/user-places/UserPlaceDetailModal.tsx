/**
 * 유저 가게 상세 정보 모달
 */

import type { AdminUserPlaceListItem, UpdateUserPlaceByAdminRequest } from '@/types/admin';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Z_INDEX } from '@/utils/constants';
import { useEscapeKey } from '@/hooks/common/useEscapeKey';
import { useModalAnimation } from '@/hooks/common/useModalAnimation';
import { useUserPlaceDetailForm } from '@/hooks/admin/useUserPlaceDetailForm';
import { UserPlaceDetailContent } from '@/components/features/admin/user-places/UserPlaceDetailContent';

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
  const { isAnimating, shouldRender } = useModalAnimation(isOpen);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const { isEditing, editForm, setIsEditing, setEditForm, handleEditSave, handleEditCancel } =
    useUserPlaceDetailForm({ place, isOpen, onUpdate, isUpdating });

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

  // Reset approval state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedAction(null);
      setRejectReason('');
      setRejectError('');
    }
  }, [isOpen]);

  useEscapeKey(onClose, isOpen);

  if (!shouldRender || !place) return null;

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

  const getStatusBadge = (status: AdminUserPlaceListItem['status']) => {
    const badges = {
      PENDING: { label: t('admin.userPlaces.status.pending'), bg: 'bg-yellow-500/20', text: 'text-yellow-600' },
      APPROVED: { label: t('admin.userPlaces.status.approved'), bg: 'bg-green-500/20', text: 'text-green-600' },
      REJECTED: { label: t('admin.userPlaces.status.rejected'), bg: 'bg-red-500/20', text: 'text-red-600' },
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
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div
          ref={modalContentRef}
          className={`relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-border-default bg-bg-surface p-6 shadow-xl custom-scroll ${
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
          <UserPlaceDetailContent
            place={place}
            isEditing={isEditing}
            editForm={editForm}
            isUpdating={isUpdating}
            approving={approving}
            rejecting={rejecting}
            selectedAction={selectedAction}
            rejectReason={rejectReason}
            rejectError={rejectError}
            onSetIsEditing={setIsEditing}
            onEditFormChange={setEditForm}
            onEditSave={handleEditSave}
            onEditCancel={handleEditCancel}
            onSetSelectedAction={setSelectedAction}
            onSetRejectReason={setRejectReason}
            onSetRejectError={setRejectError}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
