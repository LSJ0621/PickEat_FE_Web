import { useState, useCallback, useRef, useEffect } from 'react';
import type { StreamEvent } from '@/api/services/menu';

const MIN_DISPLAY_MS = 800;

interface UseStreamingRequestReturn {
  currentStatus: string | null;
  isRetrying: boolean;
  handleStreamEvent: <T>(event: StreamEvent<T>) => void;
  resetStreamState: () => void;
}

export function useStreamingRequest(): UseStreamingRequestReturn {
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const statusQueue = useRef<(string | null)[]>([]);
  const isProcessing = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastShownAt = useRef<number>(0);

  const processQueue = useCallback(() => {
    if (isProcessing.current || statusQueue.current.length === 0) return;

    isProcessing.current = true;
    const next = statusQueue.current.shift()!;

    const elapsed = Date.now() - lastShownAt.current;
    const delay = lastShownAt.current === 0 ? 0 : Math.max(0, MIN_DISPLAY_MS - elapsed);

    timerRef.current = setTimeout(() => {
      setCurrentStatus(next);
      lastShownAt.current = next !== null ? Date.now() : 0;
      isProcessing.current = false;
      processQueue();
    }, delay);
  }, []);

  const enqueueStatus = useCallback(
    (status: string | null) => {
      statusQueue.current.push(status);
      processQueue();
    },
    [processQueue],
  );

  const handleStreamEvent = useCallback(
    <T>(event: StreamEvent<T>) => {
      switch (event.type) {
        case 'status':
          enqueueStatus(event.status ?? null);
          setIsRetrying(false);
          break;
        case 'retrying':
          setIsRetrying(true);
          break;
        case 'result':
        case 'error':
          enqueueStatus(null);
          setIsRetrying(false);
          break;
      }
    },
    [enqueueStatus],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const resetStreamState = useCallback(() => {
    statusQueue.current = [];
    isProcessing.current = false;
    lastShownAt.current = 0;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCurrentStatus(null);
    setIsRetrying(false);
  }, []);

  return { currentStatus, isRetrying, handleStreamEvent, resetStreamState };
}
