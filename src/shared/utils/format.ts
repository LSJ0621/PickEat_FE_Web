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

/**
 * 표준 날짜 포맷 (YYYY-MM-DD)
 * 예: "2024-01-15"
 */
export const formatDateStandard = (date: string | Date): string => {
  return formatDate(date, 'YYYY-MM-DD');
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

/**
 * 로케일 인식 날짜·시간 포맷팅
 *
 * @param date - 날짜 문자열 또는 Date 객체
 * @param lang - 현재 언어 코드 ('ko' | 'en' 등)
 * @returns 로케일에 맞게 포맷팅된 날짜·시간 문자열
 *
 * @example
 * formatDateTimeLocale('2024-01-15T15:30:00', 'ko') // "2024년 1월 15일 오후 03:30"
 * formatDateTimeLocale('2024-01-15T15:30:00', 'en') // "January 15, 2024 at 03:30 PM"
 */
export const formatDateTimeLocale = (date: string | Date, lang: string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return typeof date === 'string' ? date : '';
  return d.toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

// 초를 MM:SS 형식으로 포맷팅
export const formatSeconds = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
};

// 날짜 범위 계산 유틸리티
export const getDateRange = (type: 'today' | 'week' | 'month'): { start: string; end: string } => {
  const today = new Date();
  const endDate = formatDateStandard(today);

  if (type === 'today') {
    return { start: endDate, end: endDate };
  }

  if (type === 'week') {
    // 이번 주 월요일 계산
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 일요일이면 -6, 아니면 월요일까지의 거리
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    return { start: formatDateStandard(monday), end: endDate };
  }

  if (type === 'month') {
    // 이번 달 1일 계산
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: formatDateStandard(firstDay), end: endDate };
  }

  return { start: '', end: '' };
};

/**
 * 생년월일 포맷팅 (YYYY-MM-DD 문자열 → 로케일 맞춤 날짜 표시)
 *
 * @param dateStr - YYYY-MM-DD 형식의 날짜 문자열
 * @param lang - 현재 언어 코드 ('ko' | 'en' 등)
 * @returns 로케일에 맞게 포맷팅된 날짜 문자열
 *
 * @example
 * formatBirthDate('1990-05-15', 'ko') // "1990년 5월 15일"
 * formatBirthDate('1990-05-15', 'en') // "May 15, 1990"
 */
export const formatBirthDate = (dateStr: string, lang: string): string => {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * 상대적 날짜 포맷팅 (예: "5분 전", "3시간 전", "2일 전")
 * 7일 초과 시 formatDateStandard 결과 반환
 */
export const formatDateRelative = (date: string | Date): string => {
  const d = new Date(date);
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  }
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  }
  if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  }
  return formatDateStandard(d);
};

/**
 * 월/일 포맷팅 (예: "1/15")
 */
export const formatMonthDay = (date: string | Date): string => {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}/${day}`;
};

/**
 * 다국어 가게 이름 포맷팅
 * localizedName이 있고 원래 이름과 다를 경우 "원래이름(번역이름)" 형식으로 반환
 *
 * @param name - 원래 가게 이름
 * @param localizedName - 번역된 가게 이름 (선택)
 * @returns 포맷팅된 가게 이름
 *
 * @example
 * formatMultilingualName("McDonald's", "맥도날드") // "McDonald's(맥도날드)"
 * formatMultilingualName("맥도날드", null) // "맥도날드"
 * formatMultilingualName("맥도날드", "맥도날드") // "맥도날드"
 */
export const formatMultilingualName = (name: string, localizedName?: string | null): string => {
  if (!localizedName || localizedName === name) {
    return name;
  }
  return `${name}(${localizedName})`;
};

/**
 * 다국어 주소 포맷팅
 * localizedAddress가 있고 원래 주소와 다를 경우 "localizedAddress(address)" 형식으로 반환
 *
 * @param address - 원본 주소 (Google에서 제공하는 현지 언어)
 * @param localizedAddress - 번역된 주소 (사용자 언어)
 * @returns 포맷팅된 주소 문자열
 *
 * @example
 * formatMultilingualAddress("123 Teheran-ro", "서울시 강남구 테헤란로") // "서울시 강남구 테헤란로(123 Teheran-ro)"
 * formatMultilingualAddress("서울시 강남구", null) // "서울시 강남구"
 * formatMultilingualAddress(null, "서울시 강남구") // "서울시 강남구"
 */
export const formatMultilingualAddress = (
  address?: string | null,
  localizedAddress?: string | null
): string => {
  // localizedAddress만 있는 경우
  if (localizedAddress && !address) {
    return localizedAddress;
  }

  // address만 있는 경우
  if (address && !localizedAddress) {
    return address;
  }

  // 둘 다 있고 다른 경우
  if (localizedAddress && address && localizedAddress !== address) {
    return `${localizedAddress}(${address})`;
  }

  // 둘 다 같거나 localizedAddress만 있는 경우
  return localizedAddress || address || '';
};

