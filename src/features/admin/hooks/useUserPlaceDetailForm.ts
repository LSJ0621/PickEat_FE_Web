/**
 * 유저 가게 상세 모달 폼 상태 관리 Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminUserPlaceListItem, UpdateUserPlaceByAdminRequest } from '@features/admin/types';
import type { EditFormState } from '@features/admin/components/user-places/UserPlaceDetailContent';
import { useToast } from '@shared/hooks/useToast';

interface UseUserPlaceDetailFormProps {
  place: AdminUserPlaceListItem | null;
  isOpen: boolean;
  onUpdate?: (id: number, data: UpdateUserPlaceByAdminRequest) => void;
  isUpdating?: boolean;
}

interface UseUserPlaceDetailFormReturn {
  isEditing: boolean;
  editForm: EditFormState;
  setIsEditing: (value: boolean) => void;
  setEditForm: (form: EditFormState) => void;
  handleEditSave: () => void;
  handleEditCancel: () => void;
}

export function useUserPlaceDetailForm({
  place,
  isOpen,
  onUpdate,
}: UseUserPlaceDetailFormProps): UseUserPlaceDetailFormReturn {
  const { t } = useTranslation();
  const { error: showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>({
    name: '',
    address: '',
    phoneNumber: '',
    openingHours: '',
    category: '',
    description: '',
    existingPhotos: [],
    newImages: [],
  });

  // Reset edit state when modal closes
  useEffect(() => {
    if (!isOpen) {
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

  const handleEditSave = useCallback(() => {
    if (!onUpdate || !place) return;

    // Validate required fields
    const trimmedName = editForm.name.trim();
    const trimmedAddress = editForm.address.trim();

    if (!trimmedName) {
      showError(t('validation.VALIDATION_REQUIRED', { field: t('fields.name') }));
      return;
    }
    if (!trimmedAddress) {
      showError(t('validation.VALIDATION_REQUIRED', { field: t('userPlace.address') }));
      return;
    }

    // Validate field lengths
    if (trimmedName.length > 100) {
      showError(t('validation.VALIDATION_MAX_LENGTH', { field: t('fields.name'), max: 100 }));
      return;
    }
    if (trimmedAddress.length > 500) {
      showError(t('validation.VALIDATION_MAX_LENGTH', { field: t('userPlace.address'), max: 500 }));
      return;
    }

    const updateData: UpdateUserPlaceByAdminRequest = { version: place.version };
    const placePhotos = place.photos || [];
    let hasChanges = false;

    // Only include changed fields
    if (trimmedName !== place.name) { updateData.name = trimmedName; hasChanges = true; }
    if (trimmedAddress !== place.address) { updateData.address = trimmedAddress; hasChanges = true; }
    if (editForm.phoneNumber.trim() !== (place.phoneNumber || '')) {
      updateData.phoneNumber = editForm.phoneNumber.trim() || undefined;
      hasChanges = true;
    }
    if (editForm.openingHours.trim() !== (place.openingHours || '')) {
      updateData.openingHours = editForm.openingHours.trim() || undefined;
      hasChanges = true;
    }
    if (editForm.category.trim() !== (place.category || '')) {
      updateData.category = editForm.category.trim() || undefined;
      hasChanges = true;
    }
    if (editForm.description.trim() !== (place.description || '')) {
      updateData.description = editForm.description.trim() || undefined;
      hasChanges = true;
    }

    // Include existingPhotos when photos changed or new images added
    const photosChanged = JSON.stringify(editForm.existingPhotos) !== JSON.stringify(placePhotos);
    const hasNewImages = editForm.newImages.length > 0;

    if (photosChanged || hasNewImages) {
      updateData.existingPhotos = editForm.existingPhotos;
      hasChanges = true;
    }
    if (hasNewImages) {
      updateData.images = editForm.newImages;
    }

    // Check if any content changes were made (version is always present)
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    onUpdate(place.id, updateData);
  }, [editForm, onUpdate, place, showError, t]);

  const handleEditCancel = useCallback(() => {
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
  }, [place]);

  return {
    isEditing,
    editForm,
    setIsEditing,
    setEditForm,
    handleEditSave,
    handleEditCancel,
  };
}
