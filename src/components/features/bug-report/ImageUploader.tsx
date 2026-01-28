/**
 * 이미지 업로더 컴포넌트
 */

import { BUG_REPORT } from '@/utils/constants';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ImageUploaderProps {
  images: File[];
  maxImages?: number;
  onImagesChange: (images: File[]) => void;
  onRemove: (index: number) => void;
}

export const ImageUploader = ({
  images,
  maxImages = BUG_REPORT.MAX_IMAGES,
  onImagesChange,
  onRemove,
}: ImageUploaderProps) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // 파일 크기 검증
    if (file.size > BUG_REPORT.MAX_IMAGE_SIZE) {
      return t('bugReport.image.sizeLimit', { size: BUG_REPORT.MAX_IMAGE_SIZE / (1024 * 1024) });
    }
    // 파일 형식 검증
    if (!(BUG_REPORT.ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      return t('bugReport.image.formatError');
    }
    return null;
  }, [t]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setError(null);

      const newFiles: File[] = [];
      const remainingSlots = maxImages - images.length;

      if (files.length > remainingSlots) {
        setError(t('bugReport.image.maxCount', { maxImages }));
        return;
      }

      Array.from(files).forEach((file) => {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }

        if (newFiles.length < remainingSlots) {
          newFiles.push(file);
        }
      });

      if (newFiles.length > 0) {
        onImagesChange([...images, ...newFiles]);
      }
    },
    [images, maxImages, onImagesChange, t, validateFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* 드래그 앤 드롭 영역 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition ${
          isDragging
            ? 'border-pink-500 bg-pink-500/10'
            : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={BUG_REPORT.ALLOWED_IMAGE_TYPES.join(',')}
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <svg
            className="mb-4 h-12 w-12 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mb-2 text-sm font-medium text-slate-300">
            {t('bugReport.image.dragPrompt')}
          </p>
          <p className="text-xs text-slate-500">
            {t('bugReport.image.sizeInfo', { maxImages, size: BUG_REPORT.MAX_IMAGE_SIZE / (1024 * 1024) })}
          </p>
        </div>

        {/* 업로드된 이미지 썸네일 (업로드 영역 내부, 텍스트 아래에 표시) */}
        {images.length > 0 && (
          <div className="border-t border-slate-700/60 px-4 pb-4 pt-3">
            <div className="flex flex-wrap justify-center gap-3">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="group relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-800"
                >
                  <img
                    src={URL.createObjectURL(image)}
                    alt={t('bugReport.image.uploadAlt', { index: index + 1 })}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(index);
                    }}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/80 text-white opacity-0 shadow-sm transition-all hover:bg-red-600 group-hover:opacity-100"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
      )}
    </div>
  );
};

