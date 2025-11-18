/**
 * 사용자 메뉴 드롭다운 컴포넌트
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';

export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userName = useAppSelector((state) => state.auth?.user?.name);

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsOpen(false);
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        {userName && <span className="hidden sm:inline">{userName}님</span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/15 bg-slate-900/95 backdrop-blur shadow-xl">
          <div className="py-1">
            <button
              onClick={() => handleMenuItemClick('/mypage')}
              className="w-full px-4 py-2 text-left text-sm text-white transition hover:bg-white/10"
            >
              마이페이지
            </button>
            <button
              onClick={() => handleMenuItemClick('/recommendations/history')}
              className="w-full px-4 py-2 text-left text-sm text-white transition hover:bg-white/10"
            >
              추천 이력
            </button>
            <div className="my-1 border-t border-white/10" />
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-400 transition hover:bg-white/10"
            >
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

