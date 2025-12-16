/**
 * 검증 유틸리티 함수
 */

import type { CreateBugReportRequest } from '@/types/bug-report';
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
    errors.category = '카테고리를 선택해주세요.';
  }

  // 제목 검증
  if (isEmpty(data.title)) {
    errors.title = '제목을 입력해주세요.';
  } else if (data.title.length > BUG_REPORT.TITLE_MAX_LENGTH) {
    errors.title = `제목은 ${BUG_REPORT.TITLE_MAX_LENGTH}자 이하여야 합니다.`;
  }

  // 상세 내용 검증
  if (isEmpty(data.description)) {
    errors.description = '상세 내용을 입력해주세요.';
  } else if (data.description.length > BUG_REPORT.DESCRIPTION_MAX_LENGTH) {
    errors.description = `상세 내용은 ${BUG_REPORT.DESCRIPTION_MAX_LENGTH}자 이하여야 합니다.`;
  }

  // 이미지 검증
  if (images && images.length > 0) {
    if (images.length > BUG_REPORT.MAX_IMAGES) {
      errors.images = `이미지는 최대 ${BUG_REPORT.MAX_IMAGES}장까지 업로드할 수 있습니다.`;
    } else {
      for (const image of images) {
        // 파일 크기 검증
        if (image.size > BUG_REPORT.MAX_IMAGE_SIZE) {
          errors.images = `이미지 크기는 최대 ${BUG_REPORT.MAX_IMAGE_SIZE / (1024 * 1024)}MB까지 가능합니다.`;
          break;
        }
        // 파일 형식 검증
        if (!(BUG_REPORT.ALLOWED_IMAGE_TYPES as readonly string[]).includes(image.type)) {
          errors.images = '지원하지 않는 이미지 형식입니다. (jpg, jpeg, png, gif, webp만 가능)';
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

