import { useState, useCallback } from 'react';
import type { StreamEvent } from '@/api/services/menu';

interface UseStreamingRequestReturn {
  currentStatus: string | null;
  isRetrying: boolean;
  handleStreamEvent: <T>(event: StreamEvent<T>) => void;
  resetStreamState: () => void;
}

export function useStreamingRequest(): UseStreamingRequestReturn {
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleStreamEvent = useCallback(<T>(event: StreamEvent<T>) => {
    switch (event.type) {
      case 'status':
        setCurrentStatus(event.status ?? null);
        setIsRetrying(false);
        break;
      case 'retrying':
        setIsRetrying(true);
        break;
      case 'result':
      case 'error':
        setCurrentStatus(null);
        setIsRetrying(false);
        break;
    }
  }, []);

  const resetStreamState = useCallback(() => {
    setCurrentStatus(null);
    setIsRetrying(false);
  }, []);

  return { currentStatus, isRetrying, handleStreamEvent, resetStreamState };
}
