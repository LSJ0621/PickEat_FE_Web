/**
 * googleMap 유틸리티 테스트
 * HTML 새니타이즈 + 좌표 변환 동작 검증
 */

import { sanitizeHtml, getLatLngFromRestaurant } from '@shared/utils/googleMap';

describe('sanitizeHtml', () => {
  it('& → &amp;', () => {
    expect(sanitizeHtml('A&B')).toBe('A&amp;B');
  });

  it('< > → &lt; &gt;', () => {
    expect(sanitizeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('" → &quot;', () => {
    expect(sanitizeHtml('say "hello"')).toBe('say &quot;hello&quot;');
  });

  it("' → &#39;", () => {
    expect(sanitizeHtml("it's")).toBe('it&#39;s');
  });

  it('복합 특수문자 모두 치환', () => {
    expect(sanitizeHtml('<a href="x">&\'</a>')).toBe(
      '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;'
    );
  });

  it('빈 문자열 → 빈 문자열', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('특수문자 없는 문자열 → 그대로 반환', () => {
    expect(sanitizeHtml('hello world')).toBe('hello world');
  });
});

describe('getLatLngFromRestaurant', () => {
  it('latitude/longitude 있으면 → LatLngLiteral 반환', () => {
    const result = getLatLngFromRestaurant({
      name: '식당',
      latitude: 37.5,
      longitude: 127.0,
    });
    expect(result).toEqual({ lat: 37.5, lng: 127.0 });
  });

  it('mapx/mapy만 있으면 → 10000000으로 나눈 좌표 반환', () => {
    const result = getLatLngFromRestaurant({
      name: '식당',
      mapx: 1270000000,
      mapy: 375000000,
    });
    expect(result).toEqual({ lat: 37.5, lng: 127 });
  });

  it('latitude/longitude가 mapx/mapy보다 우선', () => {
    const result = getLatLngFromRestaurant({
      name: '식당',
      latitude: 37.5,
      longitude: 127.0,
      mapx: 9999,
      mapy: 9999,
    });
    expect(result).toEqual({ lat: 37.5, lng: 127.0 });
  });

  it('좌표 정보 없으면 → null', () => {
    const result = getLatLngFromRestaurant({ name: '식당' });
    expect(result).toBeNull();
  });
});
