import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

export function useHomeCtaAction() {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const handleCtaClick = useCallback(() => {
    if (isAuthenticated) {
      navigate('/agent');
    } else {
      setShowAuthPrompt(true);
    }
  }, [isAuthenticated, navigate]);

  const handleAuthConfirm = useCallback(() => {
    setShowAuthPrompt(false);
    navigate('/login');
  }, [navigate]);

  const handleAuthClose = useCallback(() => {
    setShowAuthPrompt(false);
  }, []);

  return { isAuthenticated, showAuthPrompt, handleCtaClick, handleAuthConfirm, handleAuthClose };
}
