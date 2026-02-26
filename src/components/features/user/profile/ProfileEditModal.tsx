import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';
import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import { ScrollDatePicker } from '@/components/common/ScrollDatePicker';
import { useModalAnimation } from '@/hooks/common/useModalAnimation';
import { useModalScrollLock } from '@/hooks/common/useModalScrollLock';
import { useFocusTrap } from '@/hooks/common/useFocusTrap';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { Calendar, Users } from 'lucide-react';

interface ProfileEditModalProps {
  open: boolean;
  birthDate?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  onClose: () => void;
  onSave: (data: { birthDate?: string; gender?: 'male' | 'female' | 'other' }) => Promise<boolean>;
}

export const ProfileEditModal = ({
  open,
  birthDate,
  gender,
  onClose,
  onSave,
}: ProfileEditModalProps) => {
  const { t } = useTranslation();
  const { isAnimating, shouldRender } = useModalAnimation(open);
  useModalScrollLock(open);
  const focusTrapRef = useFocusTrap(open);
  const [selectedBirthDate, setSelectedBirthDate] = useState<string | null>(birthDate || null);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'other' | null>(
    gender || null
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedBirthDate(birthDate || null);
      setSelectedGender(gender || null);
    }
  }, [open, birthDate, gender]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!shouldRender) {
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await onSave({
        birthDate: selectedBirthDate || undefined,
        gender: selectedGender || undefined,
      });
      if (success) {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const genderOptions: { value: 'male' | 'female' | 'other'; labelKey: string }[] = [
    { value: 'male', labelKey: 'user.profile.genderMale' },
    { value: 'female', labelKey: 'user.profile.genderFemale' },
    { value: 'other', labelKey: 'user.profile.genderOther' },
  ];

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-end md:items-center md:justify-center bg-black/40 backdrop-blur-sm p-4 ${
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={focusTrapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-edit-modal-title"
        className={`relative w-full max-w-md rounded-t-xl md:rounded-xl bg-bg-surface p-6 md:p-8 shadow-lg md:border md:border-border-default ${
          isAnimating ? 'modal-content-responsive-enter' : 'modal-content-responsive-exit'
        }`}
      >
        <div className="flex justify-center pb-3 md:hidden">
          <div className="h-1 w-12 rounded-full bg-border-default" />
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 id="profile-edit-modal-title" className="text-xl font-semibold text-text-primary">{t('user.profile.edit')}</h2>
          <ModalCloseButton onClose={onClose} className="static" />
        </div>

        <div className="space-y-6">
          {/* Birth Date Selection */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-medium text-text-secondary">
              <Calendar className="h-4 w-4" />
              {t('user.profile.birthDate')}
            </label>
            <ScrollDatePicker
              value={selectedBirthDate}
              onChange={setSelectedBirthDate}
              minYear={1940}
              maxYear={new Date().getFullYear()}
            />
          </div>

          {/* Gender Selection */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-medium text-text-secondary">
              <Users className="h-4 w-4" />
              {t('user.profile.gender')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {genderOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] border p-3 text-sm transition ${
                    selectedGender === option.value
                      ? 'border-brand-primary bg-brand-tertiary text-brand-primary font-medium'
                      : 'border-border-default bg-bg-surface text-text-secondary hover:bg-bg-hover'
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={option.value}
                    checked={selectedGender === option.value}
                    onChange={(e) => setSelectedGender(e.target.value as 'male' | 'female' | 'other')}
                    className="sr-only"
                  />
                  {t(option.labelKey)}
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-border-light pt-4">
            <Button onClick={handleSave} isLoading={isSaving} size="lg" variant="primary" className="w-full">
              {t('user.profile.save')}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
