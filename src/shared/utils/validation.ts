/**
 * 검증 유틸리티 함수
 */

import i18n from '@/i18n/config';
import type { CreateBugReportRequest } from '@features/bug-report/types';
import { BUG_REPORT, VALIDATION } from './constants';

// 이메일 검증
export const isValidEmail = (email: string): boolean => {
  return VALIDATION.EMAIL_REGEX.test(email);
};

// 비밀번호 검증
export const isValidPassword = (password: string): boolean => {
  return password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
};

// 비밀번호 확인 검증
export const isPasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

// 전화번호 검증
export const isValidPhone = (phone: string): boolean => {
  return VALIDATION.PHONE_REGEX.test(phone);
};

// 빈 값 검증
export const isEmpty = (value: string | null | undefined): boolean => {
  return !value || value.trim().length === 0;
};

// 버그 리포트 검증
export const validateBugReport = (
  data: CreateBugReportRequest,
  images?: File[]
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // 카테고리 검증
  if (!data.category) {
    errors.category = i18n.t('validation.bugReport.categoryRequired');
  }

  // 제목 검증
  if (isEmpty(data.title)) {
    errors.title = i18n.t('validation.bugReport.titleRequired');
  } else if (data.title.length > BUG_REPORT.TITLE_MAX_LENGTH) {
    errors.title = i18n.t('validation.bugReport.titleTooLong');
  }

  // 상세 내용 검증
  if (isEmpty(data.description)) {
    errors.description = i18n.t('validation.bugReport.contentRequired');
  } else if (data.description.length > BUG_REPORT.DESCRIPTION_MAX_LENGTH) {
    errors.description = i18n.t('validation.bugReport.contentTooLong');
  }

  // 이미지 검증
  if (images && images.length > 0) {
    if (images.length > BUG_REPORT.MAX_IMAGES) {
      errors.images = i18n.t('validation.bugReport.imageLimitExceeded');
    } else {
      for (const image of images) {
        // 파일 크기 검증
        if (image.size > BUG_REPORT.MAX_IMAGE_SIZE) {
          errors.images = i18n.t('validation.bugReport.imageSizeExceeded');
          break;
        }
        // 파일 형식 검증
        if (!(BUG_REPORT.ALLOWED_IMAGE_TYPES as readonly string[]).includes(image.type)) {
          errors.images = i18n.t('validation.bugReport.imageFormatInvalid');
          break;
        }
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

