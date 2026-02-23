/**
 * 버그 제보 페이지
 */

import { bugReportService } from '@/api/services/bug-report';
import { BugReportForm } from '@/components/features/bug-report/BugReportForm';
import { PageContainer } from '@/components/common/PageContainer';
import { PageHeader } from '@/components/common/PageHeader';
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
    <PageContainer maxWidth="max-w-2xl">
      <PageHeader
        title={t('bugReport.pageTitle')}
        subtitle={t('bugReport.pageDescription')}
      />

      <div className="rounded-2xl border border-border-default bg-bg-surface p-6 shadow-lg shadow-black/10 sm:p-8">
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
    </PageContainer>
  );
};
