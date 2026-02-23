import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';
import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import { ScrollDatePicker } from '@/components/common/ScrollDatePicker';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { useModalAnimation } from '@/hooks/common/useModalAnimation';
import { useModalScrollLock } from '@/hooks/common/useModalScrollLock';
import { useEscapeKey } from '@/hooks/common/useEscapeKey';
import { Z_INDEX } from '@/utils/constants';

interface ProfileEditModalProps {
  open: boolean;
  birthDate?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  onClose: () => void;
  onSave: (data: { birthDate?: string; gender?: 'male' | 'female' | 'other' }) => Promise<boolean>;
}

const GENDER_OPTIONS: { value: 'male' | 'female' | 'other'; labelKey: string }[] = [
  { value: 'male', labelKey: 'user.profile.genderMale' },
  { value: 'female', labelKey: 'user.profile.genderFemale' },
  { value: 'other', labelKey: 'user.profile.genderOther' },
];

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

  const [selectedBirthDate, setSelectedBirthDate] = useState<string | null>(birthDate ?? null);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'other' | null>(
    gender ?? null
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedBirthDate(birthDate ?? null);
      setSelectedGender(gender ?? null);
    }
  }, [open, birthDate, gender]);

  useEscapeKey(onClose, open);

  if (!shouldRender) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await onSave({
        birthDate: selectedBirthDate ?? undefined,
        gender: selectedGender ?? undefined,
      });
      if (success) onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-edit-title"
      className={[
        'fixed inset-0 flex p-4 bg-black/40 backdrop-blur-sm',
        'items-end sm:items-center',
        `z-[${Z_INDEX.MODAL_BACKDROP}]`,
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit',
      ].join(' ')}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={[
          'relative w-full max-w-md mx-auto bg-bg-surface border border-border-default shadow-2xl',
          'rounded-t-2xl sm:rounded-2xl',
          'p-6 sm:p-8',
          isAnimating ? 'modal-content-enter' : 'modal-content-exit',
        ].join(' ')}
      >
        <ModalCloseButton onClose={onClose} />
        <h2 id="profile-edit-title" className="mb-6 text-2xl font-bold text-text-primary">
          {t('user.profile.edit')}
        </h2>

        <div className="space-y-6">
          {/* Birth Date */}
          <div>
            <label className="mb-3 block text-sm font-medium text-text-primary">
              {t('user.profile.birthDate')}
            </label>
            <ScrollDatePicker key={open ? 'open' : 'closed'} value={selectedBirthDate} onChange={setSelectedBirthDate} />
          </div>

          {/* Gender */}
          <fieldset>
            <legend className="mb-3 block text-sm font-medium text-text-primary">
              {t('user.profile.gender')}
            </legend>
            <div className="space-y-2" role="radiogroup">
              {GENDER_OPTIONS.map(({ value, labelKey }) => (
                <label
                  key={value}
                  className={[
                    'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition',
                    selectedGender === value
                      ? 'border-brand-primary/50 bg-brand-primary/10'
                      : 'border-border-default bg-bg-secondary hover:bg-bg-hover',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={value}
                    checked={selectedGender === value}
                    onChange={() => setSelectedGender(value)}
                    className="h-4 w-4 accent-brand-primary"
                  />
                  <span className="text-sm text-text-primary">{t(labelKey)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <Button onClick={handleSave} isLoading={isSaving} size="lg" className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-text-inverse shadow-md shadow-orange-500/30">
            {t('user.profile.save')}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
