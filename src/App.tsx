import { Button } from './components/common/Button'

const featureHighlights = [
  {
    title: 'AI 추천 주문',
    description: '팀의 취향과 날씨 데이터를 조합해 가장 만족도가 높은 메뉴를 추천합니다.',
    badge: 'New',
  },
  {
    title: '스마트 주문 동기화',
    description: '주문 상태가 실시간으로 동기화되어 매장 · 고객이 같은 정보를 공유합니다.',
    badge: 'Realtime',
  },
  {
    title: '결제 & 회계 자동화',
    description: '여러 매출 채널을 통합해 회계팀이 바로 사용할 수 있는 리포트를 생성합니다.',
    badge: 'Auto',
  },
] as const

const workflowSteps = [
  {
    title: '메뉴 온보딩',
    description: 'CSV · POS 연동으로 수분 안에 메뉴/옵션을 불러옵니다.',
  },
  {
    title: '주문 통합',
    description: '배달앱 · 키오스크 · 매장 주문을 PickEat 보드에 한 번에 모읍니다.',
  },
  {
    title: '운영 인사이트',
    description: '객단가, 재방문율, 인기 메뉴 트렌드를 대시보드에서 바로 확인하세요.',
  },
] as const

const stats = [
  { label: '평균 준비시간', value: '12분', sub: '-36% vs 이전' },
  { label: '재주문율', value: '74%', sub: '+18% 성장' },
  { label: '매장 확장 속도', value: 'x3', sub: '한 분기 기준' },
] as const

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-0 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-orange-400/40 via-rose-400/40 to-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-40 left-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-sky-500/30 via-emerald-500/20 to-transparent blur-3xl" />
        </div>

        <header className="relative z-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 text-xl font-bold text-slate-950 shadow-lg shadow-orange-500/30">
                P
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight">PickEat</p>
                <p className="text-sm text-slate-400">Intelligent ordering OS</p>
              </div>
            </div>
            <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
              <a className="hover:text-white" href="#features">
                기능
              </a>
              <a className="hover:text-white" href="#workflow">
                운영 흐름
              </a>
              <a className="hover:text-white" href="#cta">
                데모 신청
              </a>
            </div>
            <Button variant="secondary" size="sm">
              Admin 로그인
            </Button>
          </div>
        </header>

        <main className="relative z-10">
          <section className="mx-auto max-w-6xl px-6 pb-20 pt-12">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              오늘도 182개 매장이 PickEat으로 주문을 처리하고 있어요
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.4em] text-orange-300/80">
                  새로운 매장 운영 OS
                </p>
                <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
                  주문, 운영, 리포트를
                  <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-500 bg-clip-text text-transparent">
                    <br className="hidden md:block" /> 하나의 화면
                  </span>
                  에서 끝내세요
                </h1>
                <p className="mt-6 text-lg text-slate-300">
                  PickEat은 매장의 모든 주문 채널을 하나로 묶어 운영팀이 빠르게 의사결정할 수 있는
                  지표를 제공합니다. 복잡한 스프레드시트 대신 직관적인 보드를 경험해 보세요.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button size="lg">데모 예약하기</Button>
                  <Button variant="ghost" size="lg">
                    제품 투어 보기
                  </Button>
                </div>
                <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-400">
                  <div>
                    <p className="text-2xl font-semibold text-white">24K+</p>
                    <p>주문이 지난주 PickEat을 통해 처리됨</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-white">42</p>
                    <p>프랜차이즈 HQ가 운영 데이터를 통합</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 shadow-2xl shadow-rose-500/10 backdrop-blur">
                <div className="flex flex-col gap-4 rounded-3xl bg-slate-900/70 p-6">
                  <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Live Insights</p>
                  <div className="space-y-6">
                    {stats.map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">{stat.label}</p>
                          <p className="text-3xl font-semibold text-white">{stat.value}</p>
                        </div>
                        <span className="rounded-full border border-emerald-400/30 px-3 py-1 text-xs text-emerald-300">
                          {stat.sub}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 rounded-3xl bg-white/5 p-5">
                  <p className="text-sm text-slate-300">주문 채널별 비중</p>
                  <div className="mt-4 space-y-3">
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-orange-400 to-pink-500" />
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" />
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-sky-400 to-blue-500" />
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-slate-400">데이터 기준: 지난 7일</p>
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="bg-white/5 py-16 backdrop-blur">
            <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-3">
              {featureHighlights.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-3xl border border-white/10 bg-slate-900/40 p-6 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-white/30"
                >
                  <span className="inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">
                    {feature.badge}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="workflow" className="mx-auto max-w-6xl px-6 py-20">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-orange-300/80">Workflow</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">세 단계로 완성하는 운영</h2>
                <p className="mt-2 max-w-2xl text-slate-300">
                  온보딩부터 리포팅까지 필요한 화면만 남겼습니다. 어떤 단계에서든 팀이 다음 행동을 빠르게
                  결정할 수 있도록 설계됐습니다.
                </p>
              </div>
              <Button variant="ghost" size="sm">
                도입 가이드 다운로드
              </Button>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {workflowSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-lg shadow-black/30"
                >
                  <p className="text-sm font-semibold text-slate-400">0{index + 1}</p>
                  <h3 className="mt-4 text-2xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm text-slate-300">{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="cta" className="mx-auto max-w-6xl px-6 pb-24">
            <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-br from-orange-400/30 via-rose-500/30 to-fuchsia-600/40 p-10 shadow-2xl shadow-rose-500/40">
              <div className="relative z-10 max-w-3xl">
                <p className="text-sm uppercase tracking-[0.4em] text-white/80">Get Started</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">
                  팀 규모와 상관없이 2주 안에 운영 대시보드를 활성화합니다.
                </h2>
                <p className="mt-3 text-base text-amber-50/90">
                  솔루션 아키텍트와 1:1로 구성 점검을 진행하고, 파일럿 스토어 2곳까지 무료로 지원합니다.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Button size="lg" variant="secondary">
                    온보딩 미팅 잡기
                  </Button>
                  <Button size="lg" variant="ghost" className="text-white">
                    제안서 받기
                  </Button>
                </div>
              </div>
              <div className="pointer-events-none absolute -right-16 top-6 hidden h-64 w-64 rounded-full bg-white/40 blur-3xl md:block" />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
