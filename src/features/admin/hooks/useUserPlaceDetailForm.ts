/**
 * 유저 가게 상세 모달 폼 상태 관리 Hook
 */

import { useState, useEffect, useCallback } from 'react';
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

    const updateData: UpdateUserPlaceByAdminRequest = {};
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

    // Include existingPhotos when photos changed or new images added
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
  }, [editForm, onUpdate, place, showError]);

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
