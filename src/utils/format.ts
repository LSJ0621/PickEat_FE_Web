/**
 * 포맷팅 유틸리티 함수
 * 날짜, 숫자, 문자열 등을 포맷팅하는 함수들
 */

// 날짜 포맷팅
export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

// 숫자 포맷팅 (천 단위 구분)
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ko-KR').format(num);
};

// 가격 포맷팅
export const formatPrice = (price: number): string => {
  return `${formatNumber(price)}원`;
};

// 전화번호 포맷팅
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  return phone;
};

// 날짜·시간 포맷팅 (ISO 문자열 → 'YYYY-MM-DD HH:mm' 형태)
export const formatDateTime = (date: string | Date, format: string = 'YYYY-MM-DD HH:mm'): string => {
  return formatDate(date, format);
};

// 한국어 로케일 날짜 포맷팅 (예: "2024년 1월 15일")
export const formatDateKorean = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// 한국어 로케일 날짜·시간 포맷팅 (예: "2024년 1월 15일 오후 3:30")
export const formatDateTimeKorean = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

