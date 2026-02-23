/**
 * 버그 제보 폼 컴포넌트
 */

import { useTranslation } from 'react-i18next';
import { BUG_REPORT } from '@shared/utils/constants';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import type { BugReportCategory, CreateBugReportRequest } from '@features/bug-report/types';
import { ImageUploader } from './ImageUploader';

interface BugReportFormProps {
  data: CreateBugReportRequest;
  errors: Record<string, string>;
  isSubmitting: boolean;
  onCategoryChange: (category: BugReportCategory) => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onImagesChange: (images: File[]) => void;
  onRemoveImage: (index: number) => void;
  onSubmit: () => void;
}

export const BugReportForm = ({
  data,
  errors,
  isSubmitting,
  onCategoryChange,
  onTitleChange,
  onDescriptionChange,
  onImagesChange,
  onRemoveImage,
  onSubmit,
}: BugReportFormProps) => {
  const { t } = useTranslation();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-6"
    >
      {/* 카테고리 선택 */}
      <div>
        <Label className="mb-3 block text-sm font-medium text-text-secondary">
          {t('bugReport.category')}
        </Label>
        <div className="flex flex-wrap gap-3">
          {BUG_REPORT.CATEGORY_KEYS.map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-2 rounded-2xl border border-border-default bg-bg-secondary px-4 py-3 transition hover:border-brand-primary/40"
            >
              <input
                type="radio"
                name="category"
                value={key.toUpperCase()}
                checked={data.category === key.toUpperCase()}
                onChange={() => onCategoryChange(key.toUpperCase() as BugReportCategory)}
                className="h-4 w-4 text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-sm text-text-secondary">{t(`bugReport.categories.${key}`)}</span>
            </label>
          ))}
        </div>
        {errors.category && (
          <p className="mt-2 text-sm text-red-400">{errors.category}</p>
        )}
      </div>

      {/* 제목 입력 */}
      <div>
        <Label htmlFor="title" className="mb-2 block text-sm font-medium text-text-secondary">
          {t('bugReport.title')}
        </Label>
        <Input
          id="title"
          type="text"
          value={data.title}
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={BUG_REPORT.TITLE_MAX_LENGTH}
          placeholder={t('bugReport.titlePlaceholder')}
          className="rounded-2xl"
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.title && <p className="text-sm text-red-400">{errors.title}</p>}
          <p className="ml-auto text-xs text-text-placeholder">
            {data.title.length}/{BUG_REPORT.TITLE_MAX_LENGTH}
          </p>
        </div>
      </div>

      {/* 상세 내용 입력 */}
      <div>
        <Label htmlFor="description" className="mb-2 block text-sm font-medium text-text-secondary">
          {t('bugReport.content')}
        </Label>
        <textarea
          id="description"
          value={data.description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          maxLength={BUG_REPORT.DESCRIPTION_MAX_LENGTH}
          rows={6}
          placeholder={t('bugReport.contentPlaceholder')}
          className="w-full rounded-2xl border border-border-default bg-bg-secondary px-4 py-3 text-text-primary placeholder-text-placeholder focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.description && <p className="text-sm text-red-400">{errors.description}</p>}
          <p className="ml-auto text-xs text-text-placeholder">
            {data.description.length}/{BUG_REPORT.DESCRIPTION_MAX_LENGTH}
          </p>
        </div>
      </div>

      {/* 이미지 업로더 */}
      <div>
        <Label className="mb-2 block text-sm font-medium text-text-secondary">
          {t('bugReport.form.imageLabel')}
        </Label>
        <ImageUploader
          images={data.images || []}
          onImagesChange={onImagesChange}
          onRemove={onRemoveImage}
        />
        {errors.images && <p className="mt-2 text-sm text-red-400">{errors.images}</p>}
      </div>

      {/* 제출 버튼 */}
      <div className="sticky bottom-0 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 font-semibold text-white transition hover:from-pink-600 hover:to-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? t('bugReport.form.submitting') : t('bugReport.form.submit')}
        </button>
      </div>
    </form>
  );
};
