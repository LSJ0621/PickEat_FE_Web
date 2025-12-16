/**
 * 버그 제보 폼 컴포넌트
 */

import { BUG_REPORT } from '@/utils/constants';
import type { BugReportCategory, CreateBugReportRequest } from '@/types/bug-report';
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
        <label className="mb-3 block text-sm font-medium text-slate-300">카테고리</label>
        <div className="flex gap-4">
          {(['BUG', 'INQUIRY', 'OTHER'] as BugReportCategory[]).map((category) => (
            <label
              key={category}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 transition hover:border-slate-600"
            >
              <input
                type="radio"
                name="category"
                value={category}
                checked={data.category === category}
                onChange={() => onCategoryChange(category)}
                className="h-4 w-4 text-pink-500 focus:ring-pink-500"
              />
              <span className="text-sm text-slate-300">{BUG_REPORT.CATEGORIES[category]}</span>
            </label>
          ))}
        </div>
        {errors.category && (
          <p className="mt-2 text-sm text-red-400">{errors.category}</p>
        )}
      </div>

      {/* 제목 입력 */}
      <div>
        <label htmlFor="title" className="mb-2 block text-sm font-medium text-slate-300">
          제목
        </label>
        <input
          id="title"
          type="text"
          value={data.title}
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={BUG_REPORT.TITLE_MAX_LENGTH}
          placeholder="버그 제보 제목을 입력해주세요"
          className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.title && <p className="text-sm text-red-400">{errors.title}</p>}
          <p className="ml-auto text-xs text-slate-500">
            {data.title.length}/{BUG_REPORT.TITLE_MAX_LENGTH}
          </p>
        </div>
      </div>

      {/* 상세 내용 입력 */}
      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-300">
          상세 내용
        </label>
        <textarea
          id="description"
          value={data.description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          maxLength={BUG_REPORT.DESCRIPTION_MAX_LENGTH}
          rows={6}
          placeholder="버그에 대한 상세한 설명을 입력해주세요"
          className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.description && <p className="text-sm text-red-400">{errors.description}</p>}
          <p className="ml-auto text-xs text-slate-500">
            {data.description.length}/{BUG_REPORT.DESCRIPTION_MAX_LENGTH}
          </p>
        </div>
      </div>

      {/* 이미지 업로더 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">이미지 (선택)</label>
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
          className="w-full rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 font-semibold text-white transition hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '제출 중...' : '제출하기'}
        </button>
      </div>
    </form>
  );
};

