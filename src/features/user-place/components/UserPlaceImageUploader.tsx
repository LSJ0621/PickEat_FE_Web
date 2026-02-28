/**
 * User Place 이미지 업로더 컴포넌트
 * 기존 사진(URL)과 새 파일(File) 관리를 지원
 */

import { USER_PLACE } from '@shared/utils/constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UserPlaceImageUploaderProps {
  existingPhotos: string[]; // 서버에서 가져온 사진 URL
  newImages: File[]; // 새로 업로드할 파일
  onExistingRemove: (url: string) => void;
  onNewAdd: (files: File[]) => void;
  onNewRemove: (index: number) => void;
  maxTotal?: number; // 기본값 5
}

export function UserPlaceImageUploader({
  existingPhotos,
  newImages,
  onExistingRemove,
  onNewAdd,
  onNewRemove,
  maxTotal = USER_PLACE.MAX_IMAGES,
}: UserPlaceImageUploaderProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Map<File, string>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTotal = existingPhotos.length + newImages.length;
  const remainingSlots = maxTotal - currentTotal;

  // Generate preview URL only once per file
  const getPreviewUrl = useCallback((file: File) => {
    if (previewUrls.has(file)) {
      return previewUrls.get(file)!;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrls(prev => new Map(prev).set(file, url));
    return url;
  }, [previewUrls]);

  // Cleanup all URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const validateFile = useCallback((file: File): string | null => {
    // 파일 크기 검증
    if (file.size > USER_PLACE.MAX_IMAGE_SIZE) {
      return t('userPlace.form.uploadSizeError', { maxSize: USER_PLACE.MAX_IMAGE_SIZE / (1024 * 1024) });
    }
    // 파일 형식 검증
    if (!(USER_PLACE.ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      return t('userPlace.form.uploadTypeError');
    }
    return null;
  }, [t]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setError(null);

      if (files.length > remainingSlots) {
        setError(t('userPlace.form.uploadMaxError', { maxTotal }));
        return;
      }

      const validFiles: File[] = [];

      Array.from(files).forEach((file) => {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }

        if (validFiles.length < remainingSlots) {
          validFiles.push(file);
        }
      });

      if (validFiles.length > 0) {
        onNewAdd(validFiles);
      }
    },
    [remainingSlots, maxTotal, onNewAdd, validateFile, t]
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
    if (remainingSlots > 0) {
      fileInputRef.current?.click();
    }
  };

  // Revoke URLs when files are removed
  const handleNewImageRemove = useCallback((index: number) => {
    const fileToRemove = newImages[index];
    if (previewUrls.has(fileToRemove)) {
      URL.revokeObjectURL(previewUrls.get(fileToRemove)!);
      setPreviewUrls(prev => {
        const newMap = new Map(prev);
        newMap.delete(fileToRemove);
        return newMap;
      });
    }
    onNewRemove(index);
  }, [newImages, previewUrls, onNewRemove]);

  return (
    <div className="space-y-4">
      {/* 드래그 앤 드롭 영역 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative rounded-xl border-2 border-dashed transition ${
          remainingSlots > 0
            ? isDragging
              ? 'cursor-pointer border-brand-primary bg-brand-primary/10'
              : 'cursor-pointer border-border-default bg-bg-secondary hover:border-border-focus/40'
            : 'cursor-not-allowed border-border-default bg-bg-secondary opacity-60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={USER_PLACE.ALLOWED_IMAGE_TYPES.join(',')}
          multiple
          onChange={handleFileInputChange}
          disabled={remainingSlots <= 0}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <svg
            className="mb-4 h-12 w-12 text-text-tertiary"
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
          <p className="mb-2 text-sm font-medium text-text-secondary">
            {remainingSlots > 0
              ? t('userPlace.form.uploadDragOrClick')
              : t('userPlace.form.uploadMaxReached')}
          </p>
          <p className="text-xs text-text-placeholder">
            {t('userPlace.form.uploadHint', { maxTotal, maxSize: USER_PLACE.MAX_IMAGE_SIZE / (1024 * 1024), currentTotal })}
          </p>
        </div>

        {/* 업로드된 이미지 썸네일 */}
        {(existingPhotos.length > 0 || newImages.length > 0) && (
          <div className="border-t border-border-default px-4 pb-4 pt-3">
            <div className="flex flex-wrap justify-center gap-3">
              {/* 기존 사진 (서버에서 가져온 URL) */}
              {existingPhotos.map((url, index) => (
                <div
                  key={`existing-${index}`}
                  className="group relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-bg-tertiary"
                >
                  <img
                    src={url}
                    alt={t('userPlace.form.existingPhotoAlt', { index: index + 1 })}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {/* 기존 사진 표시 배지 */}
                  <div className="absolute left-1 top-1 rounded bg-blue-500/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {t('userPlace.form.existingPhotoBadge')}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExistingRemove(url);
                    }}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/80 text-white opacity-0 shadow-sm transition-all hover:bg-red-600 group-hover:opacity-100"
                    type="button"
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

              {/* 새로 추가한 파일 */}
              {newImages.map((image, index) => (
                <div
                  key={`new-${index}`}
                  className="group relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-bg-tertiary"
                >
                  <img
                    src={getPreviewUrl(image)}
                    alt={t('userPlace.form.newPhotoAlt', { index: index + 1 })}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {/* 새 사진 표시 배지 */}
                  <div className="absolute left-1 top-1 rounded bg-green-500/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {t('userPlace.form.newPhotoBadge')}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNewImageRemove(index);
                    }}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/80 text-white opacity-0 shadow-sm transition-all hover:bg-red-600 group-hover:opacity-100"
                    type="button"
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
}
