# 인증 (Auth) 테스트 시나리오

## Frontend Hook 테스트

### useEmailVerification
- [x] handleCheckEmail — 사용 가능한 이메일 → emailAvailable true
- [x] handleCheckEmail — 이미 존재하는 이메일 → emailAvailable false
- [x] handleSendVerificationCode — 발송 성공 → isCodeSent true + 타이머 시작
- [x] handleVerifyCode — 올바른 코드 → isEmailVerified true
- [x] handleVerifyCode — 잘못된 코드 → 에러 메시지 표시
- [x] resetEmailVerification — 모든 상태 초기화
- [x] RE_REGISTER 모드에서 중복확인 스킵 동작

### useVerificationTimer
- [x] start — 타이머 시작 후 1초마다 remaining 감소
- [x] 타이머 만료 (remaining 0) → 재발송 가능 상태
- [x] stop/reset — 타이머 정지 및 초기화

### useOAuthRedirect
- [x] RE_REGISTER_REQUIRED 에러 → showReRegisterModal true + pendingEmail 설정
- [x] RE_REGISTER_REQUIRED가 아닌 에러 → false 반환 + 모달 미표시

---

## Frontend E2E

### 회원가입 → 로그인 플로우
- [x] 이메일 입력 → 중복 확인 → 인증 코드 발송 → 코드 입력 → 가입 정보 입력 → 가입 완료 → 로그인 성공
