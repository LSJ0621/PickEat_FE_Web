/**
 * format 유틸리티 테스트
 * 날짜/시간/숫자 포맷팅 — 경계값 포함
 */

import {
  formatDate,
  formatDateStandard,
  formatNumber,
  formatPrice,
  formatPhone,
  formatSeconds,
  formatDateRelative,
  formatMonthDay,
  formatMultilingualName,
  formatMultilingualAddress,
} from '@shared/utils/format';

describe('formatDate', () => {
  it('기본 YYYY-MM-DD 포맷', () => {
    expect(formatDate('2024-06-15')).toBe('2024-06-15');
  });

  it('커스텀 HH:mm 포맷', () => {
    const result = formatDate(new Date('2024-01-15T15:30:00'), 'HH:mm');
    expect(result).toBe('15:30');
  });

  it('월/일 한 자리 → 두 자리로 패딩', () => {
    expect(formatDate('2024-01-05')).toBe('2024-01-05');
  });

  it('Date 객체 입력 처리', () => {
    expect(formatDate(new Date('2024-12-31'))).toBe('2024-12-31');
  });
});

describe('formatDateStandard', () => {
  it('Date 객체 → YYYY-MM-DD 형식', () => {
    expect(formatDateStandard(new Date('2024-06-15'))).toBe('2024-06-15');
  });

  it('연초 날짜 → 패딩 포함 YYYY-MM-DD', () => {
    expect(formatDateStandard('2024-01-01')).toBe('2024-01-01');
  });
});

describe('formatNumber', () => {
  it('1,000 이상 → 천 단위 구분', () => {
    expect(formatNumber(1000)).toBe('1,000');
  });

  it('백만 단위', () => {
    expect(formatNumber(1000000)).toBe('1,000,000');
  });

  it('0 → "0"', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('음수 처리', () => {
    expect(formatNumber(-1500)).toBe('-1,500');
  });

  it('1,000 미만 → 구분자 없음', () => {
    expect(formatNumber(999)).toBe('999');
  });
});

describe('formatPrice', () => {
  it('가격 뒤에 "원" 추가', () => {
    expect(formatPrice(15000)).toBe('15,000원');
  });

  it('0원 처리', () => {
    expect(formatPrice(0)).toBe('0원');
  });

  it('고가 → 천 단위 구분 + 원', () => {
    expect(formatPrice(1000000)).toBe('1,000,000원');
  });
});

describe('formatPhone', () => {
  it('11자리 번호 → xxx-xxxx-xxxx 형식', () => {
    expect(formatPhone('01012345678')).toBe('010-1234-5678');
  });

  it('10자리 번호 → xxx-xxx-xxxx 형식', () => {
    expect(formatPhone('0212345678')).toBe('021-234-5678');
  });

  it('하이픈 포함 입력 → 정규화 후 포맷팅', () => {
    expect(formatPhone('010-1234-5678')).toBe('010-1234-5678');
  });

  it('9자리 번호 → 그대로 반환', () => {
    expect(formatPhone('012345678')).toBe('012345678');
  });
});

describe('formatSeconds', () => {
  it('0초 → 00:00 (하한 경계값)', () => {
    expect(formatSeconds(0)).toBe('00:00');
  });

  it('59초 → 00:59 (분 경계값 직전)', () => {
    expect(formatSeconds(59)).toBe('00:59');
  });

  it('60초 → 01:00 (분 경계값)', () => {
    expect(formatSeconds(60)).toBe('01:00');
  });

  it('90초 → 01:30', () => {
    expect(formatSeconds(90)).toBe('01:30');
  });

  it('3600초(1시간) → 60:00', () => {
    expect(formatSeconds(3600)).toBe('60:00');
  });
});

describe('formatDateRelative', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('0분 전 (방금 전) → "0분 전"', () => {
    const date = new Date('2024-06-15T11:59:30'); // 30초 전
    expect(formatDateRelative(date)).toBe('0분 전');
  });

  it('30분 전 → "30분 전"', () => {
    const date = new Date('2024-06-15T11:30:00');
    expect(formatDateRelative(date)).toBe('30분 전');
  });

  it('59분 전 → "59분 전" (시간 경계값 직전)', () => {
    const date = new Date('2024-06-15T11:01:00');
    expect(formatDateRelative(date)).toBe('59분 전');
  });

  it('3시간 전 → "3시간 전"', () => {
    const date = new Date('2024-06-15T09:00:00');
    expect(formatDateRelative(date)).toBe('3시간 전');
  });

  it('2일 전 → "2일 전"', () => {
    const date = new Date('2024-06-13T12:00:00');
    expect(formatDateRelative(date)).toBe('2일 전');
  });

  it('6일 전 → "6일 전" (주 경계값 직전)', () => {
    const date = new Date('2024-06-09T12:00:00');
    expect(formatDateRelative(date)).toBe('6일 전');
  });

  it('7일 이상 → YYYY-MM-DD 형식', () => {
    const date = new Date('2024-06-07T00:00:00'); // 8일 전
    const result = formatDateRelative(date);
    expect(result).toBe('2024-06-07');
  });
});

describe('formatMonthDay', () => {
  it('1월 15일 → "1/15"', () => {
    const date = new Date('2024-01-15');
    expect(formatMonthDay(date)).toBe('1/15');
  });

  it('12월 31일 → "12/31"', () => {
    const date = new Date('2024-12-31');
    expect(formatMonthDay(date)).toBe('12/31');
  });

  it('한 자리 월/일도 구분자 없이 반환', () => {
    const date = new Date('2024-03-05');
    expect(formatMonthDay(date)).toBe('3/5');
  });
});

describe('formatMultilingualName', () => {
  it('localizedName 없으면 원래 이름 반환', () => {
    expect(formatMultilingualName("McDonald's")).toBe("McDonald's");
  });

  it('localizedName이 원래 이름과 같으면 그대로 반환', () => {
    expect(formatMultilingualName('맥도날드', '맥도날드')).toBe('맥도날드');
  });

  it('localizedName이 다르면 "원래(번역)" 형식 반환', () => {
    expect(formatMultilingualName("McDonald's", '맥도날드')).toBe("McDonald's(맥도날드)");
  });

  it('null 전달 → 원래 이름 반환', () => {
    expect(formatMultilingualName('Test Place', null)).toBe('Test Place');
  });
});

describe('formatMultilingualAddress', () => {
  it('address만 있으면 그대로 반환', () => {
    expect(formatMultilingualAddress('123 Teheran-ro')).toBe('123 Teheran-ro');
  });

  it('localizedAddress만 있으면 그대로 반환', () => {
    expect(formatMultilingualAddress(null, '서울시 강남구')).toBe('서울시 강남구');
  });

  it('둘 다 있고 다르면 "번역(원본)" 형식', () => {
    expect(formatMultilingualAddress('123 Teheran-ro', '서울시 강남구 테헤란로 123')).toBe(
      '서울시 강남구 테헤란로 123(123 Teheran-ro)',
    );
  });

  it('둘 다 같으면 그대로 반환', () => {
    expect(formatMultilingualAddress('서울시 강남구', '서울시 강남구')).toBe('서울시 강남구');
  });

  it('둘 다 null → 빈 문자열', () => {
    expect(formatMultilingualAddress(null, null)).toBe('');
  });
});
