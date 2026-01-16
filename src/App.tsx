import { useTranslation } from 'react-i18next'
import { Button } from './components/common/Button'

const featureHighlights = [
  {
    titleKey: 'landing.features.aiRecommendation.title',
    descriptionKey: 'landing.features.aiRecommendation.description',
    badge: 'New',
  },
  {
    titleKey: 'landing.features.smartSync.title',
    descriptionKey: 'landing.features.smartSync.description',
    badge: 'Realtime',
  },
  {
    titleKey: 'landing.features.paymentAutomation.title',
    descriptionKey: 'landing.features.paymentAutomation.description',
    badge: 'Auto',
  },
] as const

const workflowSteps = [
  {
    titleKey: 'landing.workflow.step1.title',
    descriptionKey: 'landing.workflow.step1.description',
  },
  {
    titleKey: 'landing.workflow.step2.title',
    descriptionKey: 'landing.workflow.step2.description',
  },
  {
    titleKey: 'landing.workflow.step3.title',
    descriptionKey: 'landing.workflow.step3.description',
  },
] as const

const stats = [
  {
    labelKey: 'landing.stats.preparationTime',
    valueKey: 'landing.stats.preparationTimeValue',
    subKey: 'landing.stats.preparationTimeSub',
  },
  {
    labelKey: 'landing.stats.reorderRate',
    valueKey: 'landing.stats.reorderRateValue',
    subKey: 'landing.stats.reorderRateSub',
  },
  {
    labelKey: 'landing.stats.expansionSpeed',
    valueKey: 'landing.stats.expansionSpeedValue',
    subKey: 'landing.stats.expansionSpeedSub',
  },
] as const

function App() {
  const { t } = useTranslation()
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
                {t('landing.nav.features')}
              </a>
              <a className="hover:text-white" href="#workflow">
                {t('landing.nav.workflow')}
              </a>
              <a className="hover:text-white" href="#cta">
                {t('landing.nav.demo')}
              </a>
            </div>
            <Button variant="secondary" size="sm">
              {t('landing.nav.adminLogin')}
            </Button>
          </div>
        </header>

        <main className="relative z-10">
          <section className="mx-auto max-w-6xl px-6 pb-20 pt-12">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {t('landing.hero.liveStatus')}
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.4em] text-orange-300/80">
                  {t('landing.hero.badge')}
                </p>
                <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
                  {t('landing.hero.title')}
                  <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-500 bg-clip-text text-transparent">
                    <br className="hidden md:block" /> {t('landing.hero.titleHighlight')}
                  </span>
                  {t('landing.hero.titleSuffix')}
                </h1>
                <p className="mt-6 text-lg text-slate-300">
                  {t('landing.hero.description')}
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button size="lg">{t('landing.hero.ctaDemo')}</Button>
                  <Button variant="ghost" size="lg">
                    {t('landing.hero.ctaProductTour')}
                  </Button>
                </div>
                <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-400">
                  <div>
                    <p className="text-2xl font-semibold text-white">24K+</p>
                    <p>{t('landing.hero.statsOrders')}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-white">42</p>
                    <p>{t('landing.hero.statsFranchise')}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 shadow-2xl shadow-rose-500/10 backdrop-blur">
                <div className="flex flex-col gap-4 rounded-3xl bg-slate-900/70 p-6">
                  <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Live Insights</p>
                  <div className="space-y-6">
                    {stats.map((stat) => (
                      <div key={stat.labelKey} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">{t(stat.labelKey)}</p>
                          <p className="text-3xl font-semibold text-white">{t(stat.valueKey)}</p>
                        </div>
                        <span className="rounded-full border border-emerald-400/30 px-3 py-1 text-xs text-emerald-300">
                          {t(stat.subKey)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 rounded-3xl bg-white/5 p-5">
                  <p className="text-sm text-slate-300">{t('landing.stats.channelDistribution')}</p>
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
                  <p className="mt-4 text-xs text-slate-400">{t('landing.stats.dataBaseline')}</p>
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="bg-white/5 py-16 backdrop-blur">
            <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-3">
              {featureHighlights.map((feature) => (
                <div
                  key={feature.titleKey}
                  className="group rounded-3xl border border-white/10 bg-slate-900/40 p-6 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-white/30"
                >
                  <span className="inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">
                    {feature.badge}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-white">{t(feature.titleKey)}</h3>
                  <p className="mt-2 text-sm text-slate-300">{t(feature.descriptionKey)}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="workflow" className="mx-auto max-w-6xl px-6 py-20">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-orange-300/80">Workflow</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">{t('landing.workflow.title')}</h2>
                <p className="mt-2 max-w-2xl text-slate-300">
                  {t('landing.workflow.description')}
                </p>
              </div>
              <Button variant="ghost" size="sm">
                {t('landing.workflow.downloadGuide')}
              </Button>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {workflowSteps.map((step, index) => (
                <div
                  key={step.titleKey}
                  className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-lg shadow-black/30"
                >
                  <p className="text-sm font-semibold text-slate-400">0{index + 1}</p>
                  <h3 className="mt-4 text-2xl font-semibold text-white">{t(step.titleKey)}</h3>
                  <p className="mt-3 text-sm text-slate-300">{t(step.descriptionKey)}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="cta" className="mx-auto max-w-6xl px-6 pb-24">
            <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-br from-orange-400/30 via-rose-500/30 to-fuchsia-600/40 p-10 shadow-2xl shadow-rose-500/40">
              <div className="relative z-10 max-w-3xl">
                <p className="text-sm uppercase tracking-[0.4em] text-white/80">Get Started</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">
                  {t('landing.cta.title')}
                </h2>
                <p className="mt-3 text-base text-amber-50/90">
                  {t('landing.cta.description')}
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Button size="lg" variant="secondary">
                    {t('landing.cta.buttonMeeting')}
                  </Button>
                  <Button size="lg" variant="ghost" className="text-white">
                    {t('landing.cta.buttonProposal')}
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
