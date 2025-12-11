/**
 * 인증 타이머 Hook
 * 이메일 인증 코드의 유효 시간을 관리하는 Hook입니다.
 */

import { useEffect, useState } from 'react';

interface UseVerificationTimerReturn {
  /** 남은 시간 (초) */
  remaining: number;
  /** 타이머 시작 */
  start: (seconds: number) => void;
  /** 타이머 중지 */
  stop: () => void;
  /** 타이머 리셋 */
  reset: () => void;
}

/**
 * 인증 타이머를 관리하는 Hook
 */
export const useVerificationTimer = (): UseVerificationTimerReturn => {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setInterval(() => {
      setRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [remaining]);

  const start = (seconds: number) => {
    setRemaining(seconds);
  };

  const stop = () => {
    setRemaining(0);
  };

  const reset = () => {
    setRemaining(0);
  };

  return {
    remaining,
    start,
    stop,
    reset,
  };
};
