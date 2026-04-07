# Frontend Structure

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite |
| State Management | Redux Toolkit (react-redux) |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| UI Components | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS (tailwind-merge, class-variance-authority) |
| Internationalization | i18next + react-i18next + browser language detector |
| Animation | Framer Motion |
| Charts | Recharts |
| Maps | Google Maps JS API (@googlemaps/js-api-loader) |
| Icons | Lucide React |
| Sanitization | DOMPurify |

## Directory Structure

```
src/
├── app/                          # Application shell
│   ├── layouts/                  # Layout components
│   │   ├── AppLayout.tsx         # Main app layout (header + footer)
│   │   ├── AdminLayout.tsx       # Admin panel layout (sidebar)
│   │   ├── AdminHeader.tsx       # Admin header bar
│   │   └── AdminSidebar.tsx      # Admin sidebar navigation
│   ├── providers/                # Context providers
│   │   └── ToastContext.tsx      # Global toast notification system
│   ├── routes/                   # React Router configuration
│   │   ├── router.tsx            # createBrowserRouter composition
│   │   ├── paths.ts              # Route path constants (ROUTES object)
│   │   ├── index.tsx             # AppRoutes (auth init, modals, RouterProvider)
│   │   ├── ProtectedRoute.tsx    # Auth guard (redirects to /login)
│   │   ├── AdminRoute.tsx        # Admin role guard
│   │   ├── UserOnlyRoute.tsx     # User-only role guard
│   │   ├── NotFound.tsx          # 404 page
│   │   └── routes/               # Route group definitions
│   │       ├── mainRoutes.tsx    # Home, Agent, Map
│   │       ├── authRoutes.tsx    # Login, Register, Password Reset, OAuth
│   │       ├── userRoutes.tsx    # MyPage, User Places
│   │       ├── historyRoutes.tsx # Recommendation, Menu Selection, Rating history
│   │       ├── adminRoutes.tsx   # Admin dashboard, users, places, reports, settings
│   │       └── miscRoutes.tsx    # Bug Report, 404 catch-all
│   └── store/                    # Redux store
│       ├── index.ts              # Store configuration + typed exports
│       ├── hooks.ts              # useAppSelector, useAppDispatch
│       ├── middleware/
│       │   └── placeCacheMiddleware.ts
│       └── slices/
│           ├── authSlice.ts      # Authentication state
│           ├── agentSlice.ts     # AI recommendation agent state
│           └── userDataSlice.ts  # Cached user data (addresses, preferences)
│
├── features/                     # Domain-specific feature modules (11 modules)
│   ├── admin/
│   ├── agent/
│   ├── auth/
│   ├── bug-report/
│   ├── history/
│   ├── home/
│   ├── map/
│   ├── onboarding/
│   ├── rating/
│   ├── user/
│   └── user-place/
│
├── components/                   # (reserved, currently empty)
│
├── shared/                       # Cross-cutting shared code
│   ├── api/                      # Axios client + endpoints
│   ├── components/               # Reusable UI components
│   ├── hooks/                    # Shared hooks
│   ├── types/                    # Shared TypeScript types
│   ├── ui/                       # shadcn/ui primitives
│   └── utils/                    # Utility functions
│
├── i18n/                         # i18next configuration
│   └── config.ts
├── locales/                      # Translation JSON files
│   ├── ko.json
│   └── en.json
├── styles/                       # Global styles
│   ├── animations.css
│   └── tokens.css
├── App.tsx
├── main.tsx
└── index.css
```

## Feature Modules

Each feature follows the pattern: `pages/` + `components/` + `hooks/` + `api.ts` + `types.ts` + `index.ts`

### agent

AI-powered food recommendation engine. Handles menu recommendations (streaming), place search (Google Places + community), and menu selection confirmation.

| Folder | Files |
|--------|-------|
| pages | Agent.tsx |
| components | ResultsSection.tsx |
| components/menu | MenuRecommendation.tsx, MenuRecommendationCard.tsx, MenuRecommendationList.tsx, MenuSelectionEditModal.tsx, MenuSelectionModal.tsx |
| components/restaurant | AiPlaceRecommendations.tsx, CompactPlaceCard.tsx, CompactPlaceGrid.tsx, MenuFilterTabs.tsx, PlaceBlogsSection.tsx, PlaceDetailBody.tsx, PlaceDetailHeader.tsx, PlaceDetailsModal.tsx, PlaceMiniMap.tsx, PlaceRecommendationCard.tsx, PlaceRecommendationList.tsx, PlaceReviewsSection.tsx, PlaceSelectionModal.tsx |
| hooks | useAgentActions.ts, useConfirmModal.ts, usePlaceDetails.ts, usePlaceSelection.ts |
| api.ts, types.ts | Menu/agent API service and types |

### auth

User authentication: email login/register, OAuth (Kakao, Google), password reset, re-registration for deactivated accounts.

| Folder | Files |
|--------|-------|
| pages | Login.tsx, Register.tsx, ReRegister.tsx, PasswordReset.tsx, PasswordResetRequest.tsx |
| components | EmailVerificationSection, LoginBrandPanel, LoginFormPanel, OAuthReRegisterModal, PasswordInputSection, ReRegisterFormSection |
| hooks | useEmailVerification.ts, useOAuthRedirect.ts, useVerificationTimer.ts |
| api.ts, types.ts | Auth API service and types |

### home

Landing page with hero section, feature showcase, how-it-works guide, CTA, and recent history for logged-in users.

| Folder | Files |
|--------|-------|
| pages | Home.tsx |
| components | CtaSection, FeatureShowcase, HeroSection, HomeRecentHistory, HowItWorks |
| hooks | useHomeCtaAction.ts, useHomeRecentHistory.ts |

### map

Google Maps integration for viewing restaurant locations.

| Folder | Files |
|--------|-------|
| pages | Map.tsx |
| hooks | useGoogleMap.ts, useUserLocation.ts |
| types | googleMaps.ts, search.ts |

### history

Browsing past AI recommendations and menu selections with date filtering.

| Folder | Files |
|--------|-------|
| pages | RecommendationHistory.tsx, MenuSelectionHistory.tsx |
| components | HistoryItem.tsx |
| hooks | useHistoryAiHistory.ts, useHistoryAiRecommendations.ts, useHistoryMenuActions.ts |

### rating

Place rating system with star input and rating prompt modal after menu selection.

| Folder | Files |
|--------|-------|
| pages | PlaceRatingHistory.tsx |
| components | RatingPromptModal.tsx, StarRatingInput.tsx |
| hooks | useRatingHistory.ts, useRatingPrompt.ts |
| api.ts, types.ts | Rating API service and types |

### user

User profile management: profile editing, food preferences, address management.

| Folder | Files |
|--------|-------|
| pages | MyPage.tsx, mypage/MyProfilePage.tsx, mypage/MyPreferencesPage.tsx, mypage/MyAddressPage.tsx |
| components/address | AddressAddModal.tsx |
| components/mypage | MyPageRow.tsx |
| components/preferences | PreferencesEditModal.tsx, PreferencesGuideSection.tsx, PreferencesSection.tsx |
| components/profile | ProfileEditModal.tsx, ProfileSection.tsx, YearScrollPicker.tsx |
| components/setup | AddressRegistrationModal.tsx, AddressSearchInput.tsx, InitialSetupAddressSection.tsx, InitialSetupModal.tsx, InitialSetupPreferencesSection.tsx |
| hooks | usePreferences.ts |
| api.ts, types.ts | User API service and types |

### user-place

User-registered restaurants (CRUD) with business hours, menu items, image upload, and admin approval status.

| Folder | Files |
|--------|-------|
| pages | UserPlaceListPage.tsx, UserPlaceCreatePage.tsx, UserPlaceEditPage.tsx |
| components | UserPlaceCard.tsx, UserPlaceForm.tsx, UserPlaceList.tsx, UserPlaceDetailModal.tsx, UserPlaceDeleteConfirm.tsx, UserPlaceImageUploader.tsx, UserPlaceStatusBadge.tsx, BusinessHoursDisplay.tsx, MenuItemsDisplay.tsx, CheckRegistrationResult.tsx, UserPlaceAddressField.tsx, UserPlaceBusinessHoursField.tsx, UserPlaceMenuTypesField.tsx |
| hooks | useUserPlaceActions.ts, useUserPlaceCreate.ts, useUserPlaceDetail.ts, useUserPlaceList.ts |
| api.ts, types.ts | User place API service and types |

### bug-report

Bug reporting with image upload support.

| Folder | Files |
|--------|-------|
| pages | BugReportPage.tsx |
| components | BugReportForm.tsx, ImageUploader.tsx |
| api.ts, types.ts | Bug report API service and types |

### onboarding

Multi-step onboarding modal for new users (intro, features, how-it-works, setup, complete).

| Folder | Files |
|--------|-------|
| components | OnboardingModal, OnboardingStepIntro, OnboardingStepFeatures, OnboardingStepHowItWorks, OnboardingStepSetup, OnboardingStepComplete |
| hooks | useOnboarding.ts |

### admin

Admin dashboard with user management, user-place moderation, bug report handling, and settings.

| Folder | Files |
|--------|-------|
| pages | dashboard/AdminDashboardPage.tsx, users/AdminUserListPage.tsx, users/AdminUserDetailPage.tsx, user-places/AdminUserPlaceListPage.tsx, bug-reports/AdminBugReportListPage.tsx, bug-reports/AdminBugReportDetailPage.tsx, settings/AdminSettingsPage.tsx |
| components/bug-reports | BugReportDetailModal.tsx, BugReportFilters.tsx, BugReportImageGallery.tsx, BugReportList.tsx, BugReportListItem.tsx, BugReportListSkeleton.tsx |
| components/common | AdminPageBackground.tsx |
| components/dashboard | DashboardSkeleton.tsx, PendingAlert.tsx, RecentActivityList.tsx, StatCard.tsx, TrendChart.tsx |
| components/settings | AddAdminModal.tsx, AdminList.tsx, AdminListItem.tsx, AdminTab.tsx, RemoveAdminConfirmModal.tsx, SettingsSkeleton.tsx |
| components/user-places | UserPlaceDetailContent.tsx, UserPlaceDetailModal.tsx, UserPlaceFilters.tsx, UserPlaceList.tsx, UserPlaceListItem.tsx, UserPlaceListSkeleton.tsx |
| components/users | UserAddressesCard.tsx, UserDetailCard.tsx, UserFilters.tsx, UserList.tsx, UserListItem.tsx, UserListSkeleton.tsx, UserPreferencesCard.tsx, UserRecentActivityCard.tsx, UserStatsCard.tsx |
| hooks | useUserPlaceDetailForm.ts |
| api.ts, api-settings.ts | Admin API services |
| types.ts, types-settings.ts | Admin types |

## Routing

All routes use lazy loading with `React.lazy()` + `<Suspense>` and are wrapped in `<AppLayout>`. Protected routes use guard components.

### Route Table

| Path | Component | Auth | Guard | Route Group |
|------|-----------|------|-------|-------------|
| `/` | HomePage | No | - | main |
| `/agent` | AgentPage | Yes | ProtectedRoute | main |
| `/map` | MapPage | Yes | ProtectedRoute | main |
| `/login` | LoginPage | No | - | auth |
| `/register` | RegisterPage | No | - | auth |
| `/re-register` | ReRegisterPage | No | - | auth |
| `/password/reset/request` | PasswordResetRequestPage | No | - | auth |
| `/password/reset` | PasswordResetPage | No | - | auth |
| `/oauth/kakao/redirect` | OAuthKakaoRedirect | No | - | auth |
| `/oauth/google/redirect` | OAuthGoogleRedirect | No | - | auth |
| `/mypage` | MyPage | Yes | ProtectedRoute | user |
| `/mypage/profile` | MyProfilePage | Yes | ProtectedRoute | user |
| `/mypage/preferences` | MyPreferencesPage | Yes | ProtectedRoute | user |
| `/mypage/address` | MyAddressPage | Yes | ProtectedRoute | user |
| `/user-places` | UserPlaceListPage | Yes | ProtectedRoute | user |
| `/user-places/create` | UserPlaceCreatePage | Yes | ProtectedRoute | user |
| `/user-places/:id/edit` | UserPlaceEditPage | Yes | ProtectedRoute | user |
| `/recommendations/history` | RecommendationHistory | Yes | ProtectedRoute | history |
| `/menu-selections/history` | MenuSelectionHistory | Yes | ProtectedRoute | history |
| `/ratings/history` | PlaceRatingHistory | Yes | ProtectedRoute | history |
| `/admin` | Redirect to /admin/dashboard | - | - | admin |
| `/admin/dashboard` | AdminDashboardPage | Yes | AdminRoute | admin |
| `/admin/users` | AdminUserListPage | Yes | AdminRoute | admin |
| `/admin/users/:id` | AdminUserDetailPage | Yes | AdminRoute | admin |
| `/admin/user-places` | AdminUserPlaceListPage | Yes | AdminRoute | admin |
| `/admin/bug-reports` | AdminBugReportListPage | Yes | AdminRoute | admin |
| `/admin/bug-reports/:id` | AdminBugReportDetailPage | Yes | AdminRoute | admin |
| `/admin/settings` | AdminSettingsPage | Yes | AdminRoute | admin |
| `/bug-report` | BugReportPage | Yes | ProtectedRoute | misc |
| `*` | NotFoundPage | No | - | misc |

### Guard Components

- **ProtectedRoute**: Checks `isAuthenticated` from Redux auth state. Redirects to `/login` with `redirectTo` state if unauthenticated.
- **AdminRoute**: Checks admin role in addition to authentication.
- **UserOnlyRoute**: Restricts to non-admin users.

## State Management

Three Redux Toolkit slices with typed hooks (`useAppSelector`, `useAppDispatch`).

### authSlice

Manages authentication state, user profile, and language preference.

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  language: Language;  // 'ko' | 'en'
}
```

**Actions**: `setCredentials`, `updateUser`, `logout`, `setLoading`, `setError`, `setLanguage`

**Thunks**: `initializeAuth` (loads user from token + preferences on app start), `logoutAsync` (API logout + clear agent state)

### agentSlice

Manages the AI recommendation workflow: menu recommendations, place search results (Google + community), selection state.

```typescript
interface AgentState {
  menuRecommendations: MenuRecommendationItemData[];
  menuRecommendationHistoryId: number | null;
  menuRecommendationPrompt: string;
  menuRecommendationRequestAddress: string | null;
  menuRecommendationIntro: string | null;
  menuRecommendationClosing: string | null;
  isMenuRecommendationLoading: boolean;
  selectedMenu: string | null;
  menuHistoryId: number | null;
  menuRequestAddress: string | null;
  searchAiRecommendationGroups: MenuPlaceRecommendationGroup[];
  isSearchAiLoading: boolean;
  searchAiLoadingMenu: string | null;
  searchAiRetrying: boolean;
  communityAiRecommendationGroups: MenuPlaceRecommendationGroup[];
  isCommunityAiLoading: boolean;
  communityAiLoadingMenu: string | null;
  communityAiRetrying: boolean;
  selectedPlace: PlaceRecommendationItem | null;
  showConfirmCard: boolean;
  hasMenuSelectionCompleted: boolean;
}
```

**Actions**: `setMenuRecommendations`, `clearMenuRecommendations`, `setSelectedMenu`, `clearSelectedMenu`, `upsertSearchAiRecommendations`, `upsertCommunityAiRecommendations`, `setSelectedPlace`, `setShowConfirmCard`, `setMenuSelectionCompleted`, `resetAiRecommendations`, `clearAgentState`, plus loading/retrying setters.

**Selectors**: Memoized `selectResultsSectionState` for the main results UI.

### userDataSlice

Cached state for addresses and preferences with 5-minute stale time to reduce API calls.

```typescript
interface UserDataState {
  addresses: {
    list: UserAddress[];
    defaultAddress: UserAddress | null;
    lastFetchedAt: number | null;
    isLoading: boolean;
    isDirty: boolean;
    error: string | null;
  };
  preferences: {
    data: Preferences | null;
    lastFetchedAt: number | null;
    isLoading: boolean;
    isDirty: boolean;
    error: string | null;
  };
}
```

**Actions**: `invalidateAddresses`, `invalidatePreferences`, `setAddresses`, `setPreferences`

**Thunks**: `fetchAddresses`, `fetchPreferences` (skip API call if cache is fresh)

### Custom Middleware

- **placeCacheMiddleware**: Handles place detail caching logic.

## API Layer

### Axios Client (`shared/api/client.ts`)

- Base URL from `VITE_API_BASE_URL` env variable (defaults to `http://localhost:3000`)
- **Request interceptor**: Injects Bearer token + `Accept-Language` header
- **Response interceptor**: Automatic 401 token refresh with single-flight pattern (one refresh request at a time). Redirects to `/login` on refresh failure.
- Separate `refreshClient` Axios instance for token refresh to avoid interceptor loops.

### Endpoints (`shared/api/endpoints.ts`)

Centralized `ENDPOINTS` object organizing all API paths by domain:

| Group | Endpoints |
|-------|-----------|
| AUTH | login, register, re-register, logout, refresh, me, check-email, kakao/google login, email send/verify code, password reset |
| MENU | recommend (+ stream), recommend places (v2, search, community, streams), restaurant blogs, recommendation detail, place detail, selections (+ history, update) |
| USER | update, delete, address search/set/list/batch-delete/default/by-id, preferences, language |
| RECOMMENDATION_HISTORY | History listing |
| BUG_REPORT | create |
| ADMIN | bug-reports (list, detail, status), dashboard (summary, recent-activities, trends), users (list, detail, deactivate, activate), user-places (list, detail, approve, reject, update), settings (admins list, admin detail) |
| RATING | select, pending, submit, skip, history, dismiss |
| USER_PLACE | check, list, create, detail, update, delete |

### Feature API Pattern

Each feature with server interaction has an `api.ts` file that imports `apiClient` and `ENDPOINTS`:

```
features/{domain}/api.ts -> apiClient + ENDPOINTS -> server
```

Features with `api.ts`: admin, agent, auth, bug-report, rating, user, user-place.

## Shared Modules

### Components (`shared/components/`)

| Component | Purpose |
|-----------|---------|
| AppHeader | Main navigation header |
| AppFooter | Application footer |
| UserMenu | Authenticated user dropdown menu |
| LanguageSelector | Language switch (ko/en) |
| AuthPromptModal | Prompts unauthenticated users to login |
| ConfirmDialog | Reusable confirmation dialog |
| Toast, ToastProvider | Toast notification system |
| StatusPopupCard | Status feedback popup |
| PageLoadingFallback | Loading spinner for lazy-loaded pages |
| SkeletonCard | Skeleton loading placeholder |
| EmptyState | Empty data placeholder |
| ErrorBoundary | Global error boundary |
| FeatureErrorBoundary | Per-feature error boundary with custom messages |
| DataErrorFallback | Data fetch error UI |
| PageContainer | Standard page wrapper |
| PageHeader | Page title header |
| ModalCloseButton | Reusable modal close button |
| Button/ | Custom button component |
| CalendarDatePicker/ | Calendar date picker (CalendarGrid, CalendarHeader) |
| ScrollDatePicker | Scroll-based date picker |
| DateInput | Date input field |
| DateFilterPanel | Date range filter panel |
| RemovableBadge | Badge with remove action |
| AddressSearchResults | Address search results display |
| OAuthLoadingScreen | OAuth redirect loading screen |
| TimePicker | Time selection component |

### Hooks (`shared/hooks/`)

| Hook | Purpose |
|------|---------|
| address/useAddressList | Address list management |
| address/useAddressSearch | Address search with Google Places |
| address/useAddressModal | Address modal state management |
| useDateFilter | Date range filtering logic |
| useDebounce | Debounced value |
| useErrorHandler | Centralized error handling |
| useEscapeKey | Escape key listener |
| useFocusTrap | Focus trap for modals |
| useInitialDataLoad | Initial data loading on app start |
| useLanguage | Language switching |
| useModalAnimation | Modal open/close animation |
| useModalScrollLock | Prevent body scroll when modal is open |
| usePrevious | Previous value reference |
| useScrollToSection | Smooth scroll to page section |
| useStreamingRequest | Server-Sent Events streaming |
| useToast | Toast notification hook |

### Utils (`shared/utils/`)

| Utility | Purpose |
|---------|---------|
| cn.ts | Tailwind class name merging (clsx + tailwind-merge) |
| constants.ts | App-wide constants (STORAGE_KEYS, API_CONFIG, VALIDATION, ERROR_MESSAGES, MAP_CONFIG, BUG_REPORT) |
| error.ts | `extractErrorMessage()` for consistent error handling |
| format.ts | Data formatting utilities |
| validation.ts | Form validation helpers |
| jwt.ts | JWT token decoding and validation |
| role.ts | User role utilities |
| motion.ts | Framer Motion animation presets |
| googleMap.ts | Google Maps integration utilities |
| googleMapLoader.ts | Google Maps JS API loader configuration |
| placeDetailCache.ts | Place detail caching logic |
| translateMessage.ts | Server message translation |
| userSetup.ts | User initialization and setup helpers |

### Types (`shared/types/`)

| File | Contents |
|------|----------|
| common.ts | PaginatedResponse, Language, and other shared types |
| api.ts | API-related type definitions |
| auth.ts | AuthResponse type (used by API client) |

### UI - shadcn/ui Components (`shared/ui/`)

| Component | Radix Primitive |
|-----------|-----------------|
| badge | - |
| button | Slot |
| card | - |
| checkbox | @radix-ui/react-checkbox |
| dialog | @radix-ui/react-dialog |
| input | - |
| label | @radix-ui/react-label |
| select | @radix-ui/react-select |
| skeleton | - |
| tabs | @radix-ui/react-tabs |

Additional Radix primitives installed but used directly (not in `shared/ui/`): accordion, avatar, popover, progress, radio-group, scroll-area, separator, switch, tooltip.

## Internationalization

- **Configuration**: `src/i18n/config.ts` using i18next with browser language detection
- **Supported languages**: Korean (`ko` - fallback), English (`en`)
- **Detection order**: localStorage > browser navigator
- **Translation files**: `src/locales/ko.json`, `src/locales/en.json`
- **Language sync**: Server `preferredLanguage` synced to client on auth initialization and login. Users can switch via `LanguageSelector` component. The `Accept-Language` header is sent with every API request.

## Layouts

| Layout | Usage |
|--------|-------|
| AppLayout | Wraps all routes. Renders AppHeader + AppFooter (configurable via `showHeader`/`showFooter` props). OAuth redirect pages hide header/footer. |
| AdminLayout | Wraps admin routes inside AppLayout. Adds AdminHeader + AdminSidebar for admin panel navigation. |
