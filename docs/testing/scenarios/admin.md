# 알림 및 관리자 (Admin) 테스트 시나리오

## Frontend Hook 테스트

### useUserPlaceDetailForm
- [x] 초기 상태 — isEditing false, editForm이 place props 값으로 초기화
- [x] place props 변경 — editForm이 새 값으로 재초기화
<!-- 제거: toggleEdit 함수 없음. 실제 API는 setIsEditing(value). 기존 "setIsEditing(true)" 시나리오가 이를 대체 -->
<!-- 제거: updateField 함수 없음. 실제 API는 setEditForm(전체 상태 교체). 기존 handleSave 케이스들이 필드별 동작을 커버 -->
- [x] handleSave — name 누락 시 에러 처리, onUpdate 호출 안 함
- [x] handleSave — address 누락 시 에러 처리, onUpdate 호출 안 함
- [x] handleSave — name 100자 초과 시 에러 처리
<!-- 제거: description 길이 검증 없음. 실제 Hook은 name(100), address(500)만 검증 -->
- [x] handleSave — 변경된 필드만 updateData에 포함하여 onUpdate 호출
- [x] handleSave — 이미지 변경 없으면 photos 필드 생략
- [x] handleSave — 변경 사항 없음 시 onUpdate 호출 안 함 + 안내 처리
<!-- 제거: handleSave 성공 시 isEditing을 내부에서 false로 전환하지 않음. onUpdate 완료 후 부모가 제어 -->
- [x] handleCancel — editForm을 place 원본으로 복원 + isEditing false
- [x] 모달 닫힘 (isOpen false) → 편집 상태 리셋

---

## Backend API 테스트

### 공지사항 관리 (Admin Notification)
- [x] POST /admin/notifications — 공지 생성 (title, content, type) → 201
- [x] GET /admin/notifications — 목록 조회 (페이지네이션 + 필터) → 200
- [x] GET /admin/notifications/:id — 상세 조회 → 200
- [x] PATCH /admin/notifications/:id — 수정 → 200
- [x] DELETE /admin/notifications/:id — 삭제 (soft delete) → 200
- [x] 일반 사용자 접근 → 403

### 대시보드 (Admin Dashboard)
- [x] GET /admin/dashboard/summary — 통계 요약 → 200
- [x] GET /admin/dashboard/recent-activities — 최근 활동 → 200
- [x] GET /admin/dashboard/trends — 트렌드 데이터 (기간 필터) → 200
- [x] 일반 사용자 접근 → 403

### 사용자 관리 (Admin User)
- [x] GET /admin/users — 사용자 목록 (검색, 필터, 정렬) → 200
- [x] GET /admin/users/:id — 사용자 상세 조회 → 200
- [x] PATCH /admin/users/:id/deactivate — 비활성화 → 200
- [x] 비활성화된 사용자의 API 접근 차단 확인
- [x] PATCH /admin/users/:id/activate — 활성화 → 200
- [x] 일반 사용자 접근 → 403

### 사용자 장소 관리 (Admin User Place)
- [x] GET /admin/user-places — 전체 가게 목록 (필터/정렬) → 200
- [x] GET /admin/user-places/:id — 가게 상세 조회 → 200
- [x] PATCH /admin/user-places/:id/approve — 가게 승인 → 200
- [x] PATCH /admin/user-places/:id/reject — 가게 거부 (사유 포함) → 200
- [x] PATCH /admin/user-places/:id — 가게 정보 수정 (이미지 포함) → 200
- [x] 일반 사용자 접근 → 403

### 관리자 설정 (Admin Settings)
- [x] GET /admin/settings/admins — 관리자 목록 → 200
- [x] POST /admin/settings/admins — 관리자 승격 → 201
- [x] DELETE /admin/settings/admins/:id — 관리자 강등 → 200
- [x] ADMIN(SuperAdmin 아닌) 접근 → 403
