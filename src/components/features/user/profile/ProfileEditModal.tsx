import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';
import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

interface ProfileEditModalProps {
  open: boolean;
  birthYear?: number | null;
  gender?: 'male' | 'female' | 'other' | null;
  onClose: () => void;
  onSave: (data: { birthYear?: number; gender?: 'male' | 'female' | 'other' }) => Promise<boolean>;
}

export const ProfileEditModal = ({
  open,
  birthYear,
  gender,
  onClose,
  onSave,
}: ProfileEditModalProps) => {
  const { t } = useTranslation();
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(open);
  const [selectedBirthYear, setSelectedBirthYear] = useState<number | null>(birthYear || null);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'other' | null>(
    gender || null
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setSelectedBirthYear(birthYear || null);
      setSelectedGender(gender || null);
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
  }, [open, birthYear, gender]);

  if (!shouldRender) {
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await onSave({
        birthYear: selectedBirthYear || undefined,
        gender: selectedGender || undefined,
      });
      if (success) {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Generate year options (1900 to current year)
  const MIN_YEAR = 1900;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - MIN_YEAR + 1 }, (_, i) => currentYear - i);

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm ${
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
    >
      <div
        className={`relative w-full max-w-md rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl backdrop-blur ${
          isAnimating ? 'modal-content-enter' : 'modal-content-exit'
        }`}
      >
        <ModalCloseButton onClose={onClose} />
        <h2 className="mb-6 text-2xl font-bold text-white">{t('user.profile.edit')}</h2>

        <div className="space-y-6">
          {/* Birth Year Selection */}
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-200">
              {t('user.profile.birthYear')}
            </label>
            <select
              value={selectedBirthYear || ''}
              onChange={(e) => setSelectedBirthYear(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-white transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
            >
              <option value="" className="bg-slate-800">
                {t('user.profile.notSet')}
              </option>
              {years.map((year) => (
                <option key={year} value={year} className="bg-slate-800">
                  {year}년
                </option>
              ))}
            </select>
          </div>

          {/* Gender Selection */}
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-200">
              {t('user.profile.gender')}
            </label>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={selectedGender === 'male'}
                  onChange={(e) => setSelectedGender(e.target.value as 'male')}
                  className="h-4 w-4 accent-orange-500"
                />
                <span className="text-sm text-slate-200">{t('user.profile.genderMale')}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={selectedGender === 'female'}
                  onChange={(e) => setSelectedGender(e.target.value as 'female')}
                  className="h-4 w-4 accent-orange-500"
                />
                <span className="text-sm text-slate-200">{t('user.profile.genderFemale')}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10">
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  checked={selectedGender === 'other'}
                  onChange={(e) => setSelectedGender(e.target.value as 'other')}
                  className="h-4 w-4 accent-orange-500"
                />
                <span className="text-sm text-slate-200">{t('user.profile.genderOther')}</span>
              </label>
            </div>
          </div>

          <Button onClick={handleSave} isLoading={isSaving} size="lg" className="w-full">
            {t('user.profile.save')}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
