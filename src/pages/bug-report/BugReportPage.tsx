/**
 * 버그 제보 페이지
 */

import { bugReportService } from '@/api/services/bug-report';
import { BugReportForm } from '@/components/features/bug-report/BugReportForm';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import type { BugReportCategory, CreateBugReportRequest } from '@/types/bug-report';
import { validateBugReport } from '@/utils/validation';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const BugReportPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { handleError, handleSuccess } = useErrorHandler();
  const [formData, setFormData] = useState<CreateBugReportRequest>({
    category: 'BUG' as BugReportCategory,
    title: '',
    description: '',
    images: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // 유효성 검증
    const validation = validateBugReport(formData, formData.images);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await bugReportService.createBugReport(formData);
      handleSuccess(t('bugReport.success'));
      navigate('/');
    } catch (error: unknown) {
      // 네트워크 에러 처리
      if (error instanceof Error && error.message.includes('Network')) {
        handleError(new Error(t('common.networkError')), 'BugReport');
      } else if (error instanceof Error && error.message.includes('413')) {
        handleError(new Error(t('bugReport.imageSizeError')), 'BugReport');
      } else {
        handleError(error, 'BugReport');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-start justify-center bg-slate-950 px-4 pt-20 pb-10 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-orange-400/40 via-pink-500/30 to-purple-600/30 blur-3xl animate-gradient" />
        <div className="absolute -bottom-40 right-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-purple-400/40 via-pink-500/30 to-orange-600/30 blur-3xl animate-gradient" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl">
          <h1 className="mb-2 text-3xl font-bold text-white">{t('bugReport.pageTitle')}</h1>
          <p className="mb-8 text-slate-400">{t('bugReport.pageDescription')}</p>

          <BugReportForm
            data={formData}
            errors={errors}
            isSubmitting={isSubmitting}
            onCategoryChange={(category) => setFormData({ ...formData, category })}
            onTitleChange={(title) => setFormData({ ...formData, title })}
            onDescriptionChange={(description) => setFormData({ ...formData, description })}
            onImagesChange={(images) => setFormData({ ...formData, images })}
            onRemoveImage={(index) => {
              const newImages = formData.images?.filter((_, i) => i !== index) || [];
              setFormData({ ...formData, images: newImages });
            }}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

