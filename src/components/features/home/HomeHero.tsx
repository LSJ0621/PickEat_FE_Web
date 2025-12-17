/**
 * 홈화면 히어로 섹션 컴포넌트
 */

import { AuthPromptModal } from '@/components/common/AuthPromptModal';
import { Button } from '@/components/common/Button';
import { useAppSelector } from '@/store/hooks';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const HomeHero = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  return (
    <>
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.4em] text-orange-200/80 animate-fade-in">
            PickEat OS
          </p>
          <h1 className="mt-6 text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl animate-fade-in-up">
            오늘 뭐 먹지?
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-500 bg-clip-text text-transparent">
              AI 에이전트
            </span>
            에게 맡기세요
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl animate-fade-in-up-delay">
            PickEat은 메뉴 추천과 가게 탐색 과정을 자동화하는 AI 기반 추천 OS입니다.
            <br />
            로그인하고 나만의 식사 플로우를 경험해보세요.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-in-up-delay-2">
          {!isAuthenticated ? (
            <>
              <Button size="lg" onClick={() => navigate('/login')} className="px-8 py-6 text-lg">
                로그인하고 시작하기
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setShowAuthPrompt(true)}
                className="px-8 py-6 text-lg"
              >
                에이전트 화면 미리보기
              </Button>
            </>
          ) : (
            <>
              <Button size="lg" onClick={() => navigate('/agent')} className="px-8 py-6 text-lg">
                에이전트 바로 이용하기
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate('/recommendations/history')}
                className="px-8 py-6 text-lg"
              >
                최근 추천 이력 보기
              </Button>
            </>
          )}
        </div>

        {/* 스크롤 인디케이터 */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-bounce sm:bottom-20">
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <span className="text-xs uppercase tracking-wider">Scroll</span>
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </section>

      <AuthPromptModal
        open={showAuthPrompt}
        onConfirm={() => {
          setShowAuthPrompt(false);
          navigate('/login');
        }}
        onClose={() => setShowAuthPrompt(false)}
      />
    </>
  );
};
