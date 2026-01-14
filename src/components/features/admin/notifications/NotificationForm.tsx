/**
 * 공지사항 생성/수정 폼 컴포넌트
 */

import type {
  CreateNotificationRequest,
  NotificationType,
  NotificationStatus,
} from '@/types/notification';
import { useState } from 'react';

interface NotificationFormProps {
  initialData?: CreateNotificationRequest & { id?: number };
  onSubmit: (data: CreateNotificationRequest) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const NotificationForm = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: NotificationFormProps) => {
  const [formData, setFormData] = useState<CreateNotificationRequest>({
    type: initialData?.type || 'NOTICE',
    title: initialData?.title || '',
    content: initialData?.content || '',
    status: initialData?.status || 'DRAFT',
    isPinned: initialData?.isPinned || false,
    scheduledAt: initialData?.scheduledAt || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    } else if (formData.title.length > 100) {
      newErrors.title = '제목은 100자 이내로 입력해주세요.';
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    }

    if (formData.status === 'SCHEDULED' && !formData.scheduledAt) {
      newErrors.scheduledAt = '예약 일시를 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: CreateNotificationRequest = {
      type: formData.type,
      title: formData.title.trim(),
      content: formData.content.trim(),
      status: formData.status,
      isPinned: formData.isPinned,
    };

    if (formData.status === 'SCHEDULED' && formData.scheduledAt) {
      submitData.scheduledAt = formData.scheduledAt;
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 유형 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">
          유형 <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as NotificationType })
            }
            className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-4 pr-10 py-2 text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          >
            <option value="NOTICE">공지</option>
            <option value="UPDATE">업데이트</option>
            <option value="EVENT">이벤트</option>
            <option value="MAINTENANCE">점검</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg
              className="h-4 w-4 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* 제목 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">
          제목 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="공지사항 제목을 입력하세요"
          maxLength={100}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
        />
        {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
        <p className="mt-1 text-xs text-slate-500">{formData.title.length}/100</p>
      </div>

      {/* 내용 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">
          내용 <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="공지사항 내용을 입력하세요 (마크다운 형식 지원)"
          rows={10}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
        />
        {errors.content && <p className="mt-1 text-sm text-red-400">{errors.content}</p>}
        <p className="mt-1 text-xs text-slate-500">마크다운 형식으로 작성할 수 있습니다.</p>
      </div>

      {/* 상태 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">상태</label>
        <div className="relative">
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as NotificationStatus })
            }
            className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-4 pr-10 py-2 text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          >
            <option value="DRAFT">임시저장</option>
            <option value="SCHEDULED">예약</option>
            <option value="PUBLISHED">공개</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg
              className="h-4 w-4 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* 예약 일시 (상태가 SCHEDULED일 때만 표시) */}
      {formData.status === 'SCHEDULED' && (
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            예약 일시 <span className="text-red-400">*</span>
          </label>
          <input
            type="datetime-local"
            value={formData.scheduledAt}
            onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          />
          {errors.scheduledAt && (
            <p className="mt-1 text-sm text-red-400">{errors.scheduledAt}</p>
          )}
        </div>
      )}

      {/* 고정 여부 */}
      <div>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={formData.isPinned}
            onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
            className="h-5 w-5 cursor-pointer rounded border-slate-600 bg-slate-800 text-pink-500 focus:ring-2 focus:ring-pink-500/20"
          />
          <span className="text-sm text-slate-300">상단 고정</span>
        </label>
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-600 bg-slate-800 px-6 py-2 text-sm text-slate-300 transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-2 text-sm font-medium text-white transition hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '저장 중...' : initialData?.id ? '수정' : '생성'}
        </button>
      </div>
    </form>
  );
};
