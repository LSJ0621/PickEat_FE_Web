/**
 * 버그 제보 상세 모달 컴포넌트
 */

import { bugReportService } from '@/api/services/bug-report';
import { BugReportImageGallery } from './BugReportImageGallery';
import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import type { GetBugReportDetailResponse } from '@/types/bug-report';
import { Z_INDEX } from '@/utils/constants';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface BugReportDetailModalProps {
  bugReportId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
}

export const BugReportDetailModal = ({
  bugReportId,
  isOpen,
  onClose,
  onStatusChange,
}: BugReportDetailModalProps) => {
  const { t } = useTranslation();
  const { handleError, handleSuccess } = useErrorHandler();
  const [bugReport, setBugReport] = useState<GetBugReportDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // 데이터 로드
  useEffect(() => {
    if (isOpen && bugReportId) {
      setLoading(true);
      setBugReport(null); // 이전 데이터 초기화
      bugReportService
        .getBugReportDetail(bugReportId)
        .then((data) => {
          setBugReport(data);
        })
        .catch((error: unknown) => {
          // 네트워크 에러 처리
          if (error instanceof Error && error.message.includes('Network')) {
            handleError(new Error(t('common.networkError')), 'BugReportDetailModal');
          } else {
            handleError(error, 'BugReportDetailModal');
          }
          onClose();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setBugReport(null);
    }
  }, [isOpen, bugReportId, handleError, onClose]);

  // 모달이 열릴 때 스크롤 위치 초기화
  useEffect(() => {
    if (isOpen && modalContentRef.current) {
      const timer = setTimeout(() => {
        if (modalContentRef.current) {
          modalContentRef.current.scrollTop = 0;
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleStatusChange = async () => {
    if (!bugReport || bugReport.status === 'CONFIRMED') return;

    setUpdating(true);
    try {
      await bugReportService.updateBugReportStatus(bugReport.id, 'CONFIRMED');
      handleSuccess(t('bugReport.detail.statusChanged'));
      setBugReport({ ...bugReport, status: 'CONFIRMED' });
      onStatusChange?.();
    } catch (error: unknown) {
      // 네트워크 에러 처리
      if (error instanceof Error && error.message.includes('Network')) {
        handleError(new Error(t('common.networkError')), 'BugReportDetailModal');
      } else {
        handleError(error, 'BugReportDetailModal');
      }
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
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
  }, [isOpen]);

  if (!shouldRender) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 flex items-start justify-center bg-black/70 p-4 pt-8 backdrop-blur overflow-y-auto ${
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
      style={{ zIndex: Z_INDEX.PRIORITY_MODAL }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalContentRef}
        className={`relative w-full max-w-2xl max-h-[calc(100vh-2rem)] rounded-[32px] border border-white/10 bg-bg-primary p-6 text-text-primary shadow-2xl overflow-y-auto custom-scroll ${
          isAnimating ? 'modal-content-enter' : 'modal-content-exit'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalCloseButton onClose={onClose} />

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-brand-primary" />
          </div>
        )}

        {!loading && bugReport && (
          <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span className="rounded-full bg-bg-surface px-3 py-1 text-xs font-medium text-text-secondary">
                    {t(`bugReport.categories.${bugReport.category.toLowerCase()}`)}
                  </span>
                  {bugReport.status === 'CONFIRMED' ? (
                    <span className="rounded-full bg-success-bg px-3 py-1 text-xs font-medium text-success">
                      {t('bugReport.status.confirmed')}
                    </span>
                  ) : (
                    <span className="rounded-full bg-brand-tertiary px-3 py-1 text-xs font-medium text-brand-primary">
                      {t('bugReport.status.unconfirmed')}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-text-primary">{bugReport.title}</h2>
              </div>
            </div>

            {/* 상세 내용 */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-text-primary">{t('bugReport.detail.content')}</h3>
              <p className="whitespace-pre-wrap rounded-lg border border-[var(--border-default)] bg-bg-surface p-4 text-sm text-text-secondary">
                {bugReport.description}
              </p>
            </div>

            {/* 이미지 갤러리 */}
            {bugReport.images && bugReport.images.length > 0 && (
              <BugReportImageGallery images={bugReport.images} />
            )}

            {/* 메타 정보 */}
            <div className="space-y-2 rounded-lg border border-[var(--border-default)] bg-bg-surface p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-tertiary">{t('bugReport.detail.createdAt')}</span>
                <span className="text-text-secondary">{formatDate(bugReport.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-tertiary">{t('bugReport.detail.updatedAt')}</span>
                <span className="text-text-secondary">{formatDate(bugReport.updatedAt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-tertiary">{t('bugReport.detail.userId')}</span>
                <span className="text-text-secondary">{bugReport.user?.id ?? 'N/A'}</span>
              </div>
            </div>

            {/* 상태 변경 버튼 */}
            {bugReport.status === 'UNCONFIRMED' && (
              <div className="flex justify-end gap-3 border-t border-[var(--border-default)] pt-6">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-[var(--border-default)] bg-bg-surface px-6 py-2 text-sm text-text-secondary transition hover:bg-bg-hover"
                >
                  {t('common.close')}
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={updating}
                  className="rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-2 text-sm font-semibold text-white transition hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? t('bugReport.detail.processing') : t('bugReport.detail.confirm')}
                </button>
              </div>
            )}

            {bugReport.status === 'CONFIRMED' && (
              <div className="flex justify-end border-t border-[var(--border-default)] pt-6">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-[var(--border-default)] bg-bg-surface px-6 py-2 text-sm text-text-secondary transition hover:bg-bg-hover"
                >
                  {t('common.close')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

