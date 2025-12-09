/**
 * 검증 유틸리티 함수
 */

import { VALIDATION } from './constants';

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

