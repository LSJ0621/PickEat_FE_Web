/**
 * 이미지 업로더 컴포넌트
 */

import { BUG_REPORT } from '@shared/utils/constants';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, X } from 'lucide-react';

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

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > BUG_REPORT.MAX_IMAGE_SIZE) {
        return t('bugReport.image.sizeLimit', {
          size: BUG_REPORT.MAX_IMAGE_SIZE / (1024 * 1024),
        });
      }
      if (!(BUG_REPORT.ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
        return t('bugReport.image.formatError');
      }
      return null;
    },
    [t]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setError(null);

      const remainingSlots = maxImages - images.length;

      if (files.length > remainingSlots) {
        setError(t('bugReport.image.maxCount', { maxImages }));
        return;
      }

      const newFiles: File[] = [];

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

  const isAtLimit = images.length >= maxImages;

  return (
    <div className="space-y-3">
      {/* 드래그 앤 드롭 영역 */}
      {!isAtLimit && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={[
            'relative cursor-pointer rounded-2xl border-2 border-dashed transition-all',
            isDragging
              ? 'border-brand-primary bg-brand-primary/10 scale-[0.99]'
              : 'border-border-default bg-bg-secondary hover:border-brand-primary/40 hover:bg-bg-secondary/80',
          ].join(' ')}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={BUG_REPORT.ALLOWED_IMAGE_TYPES.join(',')}
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-tertiary">
              <ImagePlus className="h-6 w-6 text-text-tertiary" />
            </div>
            <p className="text-sm font-medium text-text-secondary">
              {t('bugReport.image.dragPrompt')}
            </p>
            <p className="text-xs text-text-placeholder">
              {t('bugReport.image.sizeInfo', {
                maxImages,
                size: BUG_REPORT.MAX_IMAGE_SIZE / (1024 * 1024),
              })}
            </p>
            <p className="text-xs text-text-placeholder">
              {images.length}/{maxImages} {t('bugReport.image.uploaded')}
            </p>
          </div>
        </div>
      )}

      {/* 업로드된 이미지 미리보기 */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-bg-tertiary shadow-sm"
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
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/90 text-white opacity-0 shadow-sm transition-all hover:bg-red-600 group-hover:opacity-100"
                aria-label={t('bugReport.image.removeAlt', { index: index + 1 })}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
};
