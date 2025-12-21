import { AuthPromptModal } from '@/components/common/AuthPromptModal';
import { InitialSetupModal } from '@/components/common/InitialSetupModal';
import { AddressRegistrationModal } from '@/components/common/AddressRegistrationModal';
import { Button } from '@/components/common/Button';
import { useAppSelector } from '@/store/hooks';
import { checkUserSetupStatus } from '@/utils/userSetup';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const user = useAppSelector((state) => state.auth?.user);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [setupStatus, setSetupStatus] = useState<ReturnType<typeof checkUserSetupStatus> | null>(null);

  // 로그인 상태일 때 필요한 정보 체크
  useEffect(() => {
    if (isAuthenticated && user) {
      const status = checkUserSetupStatus(user);
      
      // 주소만 없으면 주소 등록 모달 표시
      if (status.needsAddress && !status.needsName && !status.needsPreferences) {
        setShowAddressModal(true);
      } else if (status.hasAnyMissing) {
        // 이름이나 취향도 필요한 경우 초기 설정 모달 표시
        setSetupStatus(status);
        setShowSetupModal(true);
      }
    }
  }, [isAuthenticated, user]);

  const featureList = [
    {
      title: 'AI 메뉴 추천',
      description: '기분, 날씨, 취향을 반영한 메뉴를 실시간으로 제안합니다.',
    },
    {
      title: '메뉴별 가게 탐색',
      description: '원하는 메뉴를 고르면 근처 가게 후보를 AI가 선별합니다.',
    },
    {
      title: '히스토리 관리',
      description: '추천받은 메뉴와 가게 이력을 한눈에 확인하고 재탐색할 수 있습니다.',
    },
  ];

  const steps = [
    'AI에게 오늘의 기분이나 상황을 알려주세요.',
    '추천된 메뉴 중 마음에 드는 항목을 선택하세요.',
    '메뉴별 AI 가게 추천으로 바로 근처 식당을 확인하세요.',
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-orange-400/40 via-rose-400/30 to-purple-500/30 blur-3xl animate-gradient" />
        <div className="absolute -bottom-52 left-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-sky-500/30 via-emerald-500/20 to-transparent blur-3xl animate-gradient" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 pb-44 sm:px-6 lg:px-8">
          <section className="rounded-[32px] border border-white/10 bg-white/5 p-10 text-center shadow-2xl shadow-black/40 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.4em] text-orange-200/80">PickEat OS</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              오늘 뭐 먹지? <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-500 bg-clip-text text-transparent">AI 에이전트</span>에게 맡기세요
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base text-slate-300">
              PickEat은 메뉴 추천부터 가게 탐색, 재방문까지 전 과정을 자동화하는 AI 기반 추천 OS입니다.
              로그인하고 나만의 식사 플로우를 경험해보세요.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Button size="lg" onClick={() => navigate('/login')}>
                    로그인하고 시작하기
                  </Button>
                  <Button variant="ghost" size="lg" onClick={() => setShowAuthPrompt(true)}>
                    에이전트 화면 미리보기
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate('/agent')}>
                    에이전트 바로 이용하기
                  </Button>
                  <Button variant="ghost" size="lg" onClick={() => navigate('/recommendations/history')}>
                    최근 추천 이력 보기
                  </Button>
                </>
              )}
            </div>
          </section>

          <section className="mt-12 grid gap-6 md:grid-cols-3">
            {featureList.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_15px_40px_rgba(0,0,0,0.35)] backdrop-blur"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">Feature</p>
                <h3 className="mt-3 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
              </div>
            ))}
          </section>

          <section className="mt-12 rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-900/40 p-8 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.4em] text-orange-200/80">How it works</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">AI 추천 플로우</h2>
            <div className="mt-6 space-y-4">
              {steps.map((step, index) => (
                <div key={step} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 text-sm font-semibold text-orange-200">
                    {index + 1}
                  </span>
                  <p className="text-base text-slate-200">{step}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-[32px] border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur">
            <h2 className="text-3xl font-semibold text-white">지금 바로 PickEat을 시작해보세요</h2>
            <p className="mt-3 text-slate-300">
              로그인 후 AI 에이전트가 준비한 맞춤 추천과 가게 탐색을 경험할 수 있습니다.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Button size="lg" onClick={() => navigate('/login')}>
                    이메일로 로그인
                  </Button>
                  <Button variant="ghost" size="lg" onClick={() => setShowAuthPrompt(true)}>
                    에이전트 미리보기
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate('/agent')}>
                    에이전트로 이동
                  </Button>
                  <Button variant="ghost" size="lg" onClick={() => navigate('/mypage')}>
                    마이페이지 열어보기
                  </Button>
                </>
              )}
            </div>
          </section>
        </main>
      </div>
      <AuthPromptModal
        open={showAuthPrompt}
        onConfirm={() => {
          setShowAuthPrompt(false);
          navigate('/login');
        }}
        onClose={() => setShowAuthPrompt(false)}
      />
      {setupStatus && (
        <InitialSetupModal
          open={showSetupModal}
          setupStatus={setupStatus}
          onComplete={() => {
            setShowSetupModal(false);
            setSetupStatus(null);
          }}
        />
      )}
      <AddressRegistrationModal
        open={showAddressModal}
        onComplete={() => {
          setShowAddressModal(false);
        }}
      />
    </div>
  );
};
