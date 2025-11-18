<template>
  <section class="relative overflow-hidden bg-gradient-to-br from-surface via-white to-[#FEF7ED] py-16 sm:py-20 lg:py-24">
    <div class="mx-auto flex w-full max-w-6xl flex-col-reverse items-stretch gap-12 px-4 lg:flex-row lg:gap-14 lg:px-6">
      <div class="relative flex flex-1 flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/85 to-secondary text-white shadow-card">
        <div class="relative z-10 flex flex-col gap-8 p-9 sm:p-12">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">AI Nutrition Coach</p>
            <h2 class="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              나만의 맞춤 식단 코치와 함께하세요
            </h2>
            <p class="mt-3 text-base text-white/80">
              하루 영양 목표를 설정하고 더 스마트한 식단 추천을 받아보세요. 건강 루틴을 위한 인사이트가 매일 새롭게 제공됩니다.
            </p>
          </div>
          <ul class="space-y-4">
            <li
              v-for="benefit in heroBenefits"
              :key="benefit"
              class="flex items-center gap-3"
            >
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-secondary">
                <svg
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="text-sm text-white/90">
                {{ benefit }}
              </span>
            </li>
          </ul>
          <div class="grid gap-4 sm:grid-cols-3">
            <div
              v-for="metric in heroMetrics"
              :key="metric.label"
              class="rounded-2xl bg-white/15 px-4 py-5 backdrop-blur"
            >
              <p class="text-2xl font-semibold text-white">
                {{ metric.value }}
              </p>
              <p class="mt-1 text-xs uppercase tracking-wide text-white/70">
                {{ metric.label }}
              </p>
            </div>
          </div>
        </div>
        <div class="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/25 blur-3xl" />
        <div class="pointer-events-none absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-secondary/40 blur-3xl" />
      </div>

      <div class="w-full max-w-xl self-center lg:self-stretch">
        <div class="card h-full w-full p-8 sm:p-10">
          <div class="mb-6">
            <p class="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Welcome back</p>
            <h1 class="mt-3 text-3xl font-bold text-graphite">로그인</h1>
            <p class="mt-2 text-sm text-graphite/70">
              맞춤 식단과 주변 가게 추천을 이어서 받아보세요.
            </p>
          </div>

          <div
            v-if="errorMessage"
            class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {{ errorMessage }}
          </div>

          <form class="space-y-5" @submit.prevent="memberLogin" novalidate>
            <div class="space-y-2">
              <label for="email" class="text-sm font-medium text-graphite">이메일</label>
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                class="block w-full rounded-xl border border-graphite/15 bg-white px-4 py-3 text-sm text-graphite shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                :class="{ 'border-red-400 focus:ring-red-200': errors.email }"
                @blur="validateField('email')"
              />
              <p
                v-if="errors.email"
                class="text-sm text-red-600"
              >
                {{ errors.email }}
              </p>
            </div>

            <div class="space-y-2">
              <label for="password" class="text-sm font-medium text-graphite">패스워드</label>
              <div class="relative">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="password"
                  autocomplete="current-password"
                  placeholder="비밀번호를 입력하세요"
                  class="block w-full rounded-xl border border-graphite/15 bg-white px-4 py-3 text-sm text-graphite shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  :class="{ 'border-red-400 focus:ring-red-200': errors.password }"
                  @blur="validateField('password')"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center px-4 text-graphite/60 transition hover:text-primary focus:outline-none"
                  @click="togglePasswordVisibility"
                  :aria-label="showPassword ? '비밀번호 숨기기' : '비밀번호 표시'"
                >
                  <svg
                    v-if="showPassword"
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M9.88 9.88a3 3 0 0 0 4.24 4.24m1.88-1.88a5.5 5.5 0 0 1-7.78 0m9.9 2.24A10.44 10.44 0 0 1 12 19c-5.5 0-10-4.5-10-7a10.52 10.52 0 0 1 2.06-5.14l1.42 1.42" />
                  </svg>
                  <svg
                    v-else
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
              <p
                v-if="errors.password"
                class="text-sm text-red-600"
              >
                {{ errors.password }}
              </p>
              <div
                v-if="password"
                class="space-y-2 rounded-xl border border-graphite/10 bg-surface px-4 py-3"
              >
                <div class="flex items-center justify-between text-xs font-medium text-graphite/70">
                  <span>비밀번호 안전도</span>
                  <span :class="passwordStrengthInfo.textClass">
                    {{ passwordStrengthInfo.label }}
                  </span>
                </div>
                <div class="h-2 w-full rounded-full bg-white">
                  <div
                    class="h-2 rounded-full transition-all duration-300"
                    :class="passwordStrengthInfo.barClass"
                    :style="{ width: `${passwordStrengthInfo.percent}%` }"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-primary w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSubmitting"
            >
              <svg
                v-if="isSubmitting"
                class="-ml-1 mr-2 h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
              </svg>
              로그인
            </button>
          </form>

          <div class="mt-8">
            <div class="relative mb-6 text-center text-xs font-semibold uppercase tracking-[0.35em] text-graphite/50">
              <span class="relative z-10 bg-white px-4">간편 로그인</span>
              <span class="absolute inset-x-0 top-1/2 -z-10 h-px w-full bg-graphite/10" />
            </div>
            <div class="flex flex-col gap-3">
              <button
                type="button"
                class="btn w-full border border-graphite/15 bg-white py-3 text-sm font-medium text-graphite shadow-sm transition hover:border-graphite/30 hover:bg-white/70"
                @click="googleLogin"
              >
                Google로 계속하기
              </button>
              <button
                type="button"
                class="btn w-full bg-[#FFB300] py-3 text-sm font-semibold text-graphite transition hover:bg-[#f5a500]"
                @click="kakaoLogin"
              >
                카카오로 계속하기
              </button>
            </div>
          </div>

          <div class="mt-10 rounded-2xl border border-primary/15 bg-primary/5 px-5 py-6">
            <h2 class="text-sm font-semibold text-primary">NutriGuide AI 멤버 혜택</h2>
            <ul class="mt-4 space-y-2 text-sm text-graphite/80">
              <li
                v-for="perk in loginPerks"
                :key="perk"
                class="flex items-center gap-2"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-primary" />
                {{ perk }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import axios from 'axios';

export default {
  name: 'MemberLogin',
  data() {
    return {
      email: '',
      password: '',
      isSubmitting: false,
      showPassword: false,
      errorMessage: '',
      errors: {
        email: '',
        password: ''
      },
      googleUrl: 'https://accounts.google.com/o/oauth2/auth',
      googleClientId: '119834887772-jvvtg77vd6e6m1t3ndc5q9l8rrlklg6g.apps.googleusercontent.com',
      googleRedirectUrl: 'http://localhost:3000/oauth/google/redirect',
      googleScope: 'openid email profile',
      kakaoUrl: 'https://kauth.kakao.com/oauth/authorize',
      kakaoClientId: 'b82967657cb741bb3c4173fdfe1dc0b7',
      kakaoRedirectUrl: 'http://localhost:8080/oauth/kakao/redirect',
      heroBenefits: [
        'AI가 추천하는 맞춤 식단 플랜',
        '영양 균형 기반 데일리 리포트 제공',
        '주변 건강 식당과 배달 픽업 정보'
      ],
      heroMetrics: [
        { label: '평균 적합도', value: '92%' },
        { label: '맞춤 식단 수', value: '18' },
        { label: '영양 배지 획득', value: '12개' }
      ],
      loginPerks: ['AI 추천 받기', '맞춤 영양 데일리 리포트', '주변 가게 실시간 정보']
    };
  },
  watch: {
    email() {
      if (this.errors.email) {
        this.validateField('email');
      }
    },
    password() {
      if (this.errors.password) {
        this.validateField('password');
      }
    }
  },
  computed: {
    passwordStrengthInfo() {
      const value = this.password || '';
      const sanitized = value.trim();
      if (!sanitized) {
        return {
          label: '',
          percent: 0,
          barClass: 'bg-primary',
          textClass: 'text-graphite/60'
        };
      }

      let score = 0;
      if (sanitized.length >= 8) score += 1;
      if (/[A-Z]/.test(sanitized)) score += 1;
      if (/[0-9]/.test(sanitized)) score += 1;
      if (/[^A-Za-z0-9]/.test(sanitized)) score += 1;

      const percent = Math.round((score / 4) * 100);

      if (percent >= 75) {
        return {
          label: '안전',
          percent,
          barClass: 'bg-primary',
          textClass: 'text-primary'
        };
      }
      if (percent >= 50) {
        return {
          label: '보통',
          percent,
          barClass: 'bg-secondary',
          textClass: 'text-secondary-dark'
        };
      }
      if (percent >= 25) {
        return {
          label: '주의',
          percent,
          barClass: 'bg-orange-400',
          textClass: 'text-orange-500'
        };
      }
      return {
        label: '약함',
        percent,
        barClass: 'bg-red-500',
        textClass: 'text-red-500'
      };
    }
  },
  methods: {
    validateField(field) {
      let message = '';
      const value = (this[field] || '').trim();

      if (!value) {
        message = '필수 정보입니다.';
      } else if (field === 'email' && !/.+@.+\..+/.test(value)) {
        message = '유효한 이메일을 입력하세요.';
      }

      this.errors = {
        ...this.errors,
        [field]: message
      };

      return !message;
    },
    validateForm() {
      const emailValid = this.validateField('email');
      const passwordValid = this.validateField('password');
      return emailValid && passwordValid;
    },
    async memberLogin() {
      this.errorMessage = '';
      if (!this.validateForm()) {
        return;
      }

      this.isSubmitting = true;
      try {
        const response = await axios.post('http://localhost:8080/member/doLogin', {
          email: this.email,
          password: this.password
        });
        const token = response?.data?.token;
        if (!token) {
          throw new Error('토큰이 반환되지 않았습니다.');
        }
        localStorage.setItem('token', token);
        this.$router.push('/');
      } catch (error) {
        const message = error?.response?.data?.message;
        this.errorMessage = message || '로그인에 실패했어요. 입력값을 확인한 뒤 다시 시도해 주세요.';
      } finally {
        this.isSubmitting = false;
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    googleLogin() {
      const authUri = `${this.googleUrl}?client_id=${this.googleClientId}&redirect_uri=${this.googleRedirectUrl}&response_type=code&scope=${this.googleScope}`;
      window.location.href = authUri;
    },
    kakaoLogin() {
      const authUri = `${this.kakaoUrl}?client_id=${this.kakaoClientId}&redirect_uri=${this.kakaoRedirectUrl}&response_type=code`;
      window.location.href = authUri;
    }
  }
};
</script>


--------------------------------------------


<template>
    <div>
        카카오 로그인 진행중...
    </div>
</template>

<script>
import axios from 'axios';

export default{
    created(){
        const code = new URL(window.location.href).searchParams.get("code");
        this.sendCodeToServer(code);
    },
    methods:{
        async sendCodeToServer(code){
            const response = await axios.post("http://localhost:3000/auth/kakao/doLogin", {code});
            const token = response.data.token;
            localStorage.setItem("token", token);
            window.location.href = "/";
        }
    }
}
</script>