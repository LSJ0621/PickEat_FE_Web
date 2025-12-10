/**
 * 홈화면 최종 CTA 섹션 컴포넌트
 */

import { AuthPromptModal } from '@/components/common/AuthPromptModal';
import { Button } from '@/components/common/Button';
import { useScrollAnimation } from '@/hooks/common/useScrollAnimation';
import { useAppSelector } from '@/store/hooks';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const HomeCTA = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2, delay: 100 });

  return (
    <>
      <section
        ref={ref}
        className={`py-20 px-4 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-white/5 p-12 text-center shadow-2xl shadow-black/30 backdrop-blur">
            <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              지금 바로 PickEat을 시작해보세요
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300 sm:text-xl">
              로그인 후 AI 에이전트가 준비한 맞춤 추천과 가게 탐색을 경험할 수 있습니다.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Button size="lg" onClick={() => navigate('/login')} className="px-8 py-6 text-lg">
                    이메일로 로그인
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setShowAuthPrompt(true)}
                    className="px-8 py-6 text-lg"
                  >
                    에이전트 미리보기
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate('/agent')} className="px-8 py-6 text-lg">
                    에이전트로 이동
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => navigate('/mypage')}
                    className="px-8 py-6 text-lg"
                  >
                    마이페이지 열어보기
                  </Button>
                </>
              )}
            </div>
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
