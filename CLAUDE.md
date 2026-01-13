# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript + React + Vite based food recommendation web application. Uses Redux Toolkit for state management, React Router for routing, Axios for API communication with automatic token refresh, and Naver Maps integration.

## Development Commands

```bash
# Start development server (port 8080)
npm run dev

# Build for production (runs TypeScript compiler + Vite build)
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## Project Architecture

### Directory Structure & Responsibilities

```
src/
├── api/
│   ├── client.ts          # Axios instance with interceptors
│   ├── endpoints.ts       # All API endpoint definitions
│   └── services/          # Domain-specific API service functions
│       ├── auth.ts, user.ts, menu.ts, search.ts, bug-report.ts
├── components/
│   ├── common/            # Reusable UI components
│   ├── features/          # Feature-specific components (auth/, menu/, agent/, etc.)
│   ├── layout/            # Layout components (AppLayout.tsx)
│   └── ui/                # shadcn/ui based components (button, dialog, tabs, etc.)
├── contexts/
│   └── ToastContext.tsx   # Global toast notification system
├── pages/                 # Route page components (auth/, main/, user/, etc.)
├── hooks/                 # Custom React hooks
│   ├── Common utilities (root level):
│   │   useDebounce, useErrorHandler, useLocalStorage, useUserLocation
│   └── Domain-organized subdirectories:
│       ├── address/       # Address management hooks
│       ├── agent/         # AI agent interaction hooks
│       ├── auth/          # Authentication hooks (email verification, timer)
│       ├── common/        # Shared UI behavior hooks (modal, scroll, toast)
│       ├── history/       # User history hooks
│       ├── map/           # Map integration hooks
│       ├── place/         # Place details hooks
│       └── user/          # User preferences hooks
├── store/
│   ├── index.ts           # Redux store configuration
│   ├── hooks.ts           # Typed Redux hooks (useAppSelector, useAppDispatch)
│   └── slices/            # Redux slices (authSlice.ts, agentSlice.ts)
├── routes/                # React Router configuration (index.tsx, ProtectedRoute.tsx)
├── types/                 # TypeScript type definitions (domain-organized)
└── utils/                 # Utility functions
    ├── constants.ts       # All hardcoded values
    ├── error.ts           # Error handling utilities
    ├── validation.ts      # Validation helpers
    ├── format.ts          # Data formatting utilities
    ├── jwt.ts             # JWT token parsing and validation
    ├── naverMap.ts        # Naver Maps integration utilities
    ├── userSetup.ts       # User initialization helpers
    └── cn.ts              # Tailwind CSS class name utility
```

**Key Reusable Components in `components/common/`:**
- **Modals**: AddressRegistrationModal, InitialSetupModal, AuthPromptModal, ConfirmDialog
- **Navigation**: AppHeader, AppFooter, UserMenu
- **Feedback**: Toast, StatusPopupCard, PageLoadingFallback, SkeletonCard
- **UI**: Button/, ModalCloseButton, OAuthLoadingScreen

### Contexts

- `contexts/ToastContext.tsx` - Global toast notification system
- Use React Context API for cross-cutting concerns that don't belong in Redux
- Import: `import { useToast } from '@/contexts/ToastContext'`

### Critical Architecture Rules

- **API calls ONLY** in `api/services/` - never in pages or components
- **All endpoints** in `api/endpoints.ts` - no hardcoded URLs
- **State management ONLY** in `store/slices/`
- **Types ONLY** in `types/` - never inline complex types
- **Constants ONLY** in `utils/constants.ts` - no hardcoding
- **Business logic** extracted to custom hooks in `hooks/`
- **Components** handle UI rendering only - no API calls, no complex logic, file size under 300 lines

## Code Organization & Imports

### Import Conventions

- **ALWAYS** use absolute imports with `@/` alias (configured in vite.config.ts)
- Use `import type` for type-only imports
- **NEVER** use relative imports like `../../../components`

```typescript
// ✅ Correct
import { Button } from '@/components/common/Button';
import type { User } from '@/types/user';
```

### Naming Conventions

- Components: PascalCase (`UserProfile.tsx`)
- Functions/variables: camelCase (`getUserData`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Files: Match their primary export

## API Client Architecture

### Axios Interceptor Pattern

The API client (`src/api/client.ts`) implements:
- Automatic token injection in request headers
- Automatic token refresh on 401 responses (single-flight pattern)
- Automatic redirect to login on auth failure

**Token Refresh Flow:**
- Request fails with 401 → Calls refresh endpoint (single-flight to prevent duplicate requests) → Retries with new token or redirects to `/login` if refresh fails

### API Service Pattern

```typescript
// Pattern: api/services/user.ts
export const updateUser = async (data: UpdateUserRequest): Promise<UserResponse> => {
  const response = await apiClient.put<UserResponse>(ENDPOINTS.USER.UPDATE, data);
  return response.data;
};
```

**Service Rules:**
- Function naming: verb + noun (`getUser`, `createAddress`, `deleteOrder`)
- All endpoints from `ENDPOINTS` object - no hardcoded URLs
- Return `response.data`, not entire response
- Error handling via `extractErrorMessage` from `utils/error.ts`

## State Management

Uses Redux Toolkit with typed hooks:

```typescript
// Use typed hooks from store/hooks.ts
import { useAppSelector, useAppDispatch } from '@/store/hooks';

// NOT the raw Redux hooks
// import { useSelector, useDispatch } from 'react-redux';
```

**State Usage Rules:**
- Global state: Redux (auth, agent slices currently active)
- Local UI state: `useState` only
- Component state should NOT include business logic

## Coding Standards

### TypeScript

- **NEVER** use `any` type - use `unknown` or proper types
- Define all interfaces in `types/` organized by domain
- Explicit return types on functions

### React Components

```typescript
// Props interface at top of file
interface ButtonProps {
  label: string;
  onClick: () => void;
}

// Named exports (not default)
export function Button({ label, onClick }: ButtonProps) {
  // Component body
}
```

**Component Rules:**
- Props interface defined at file top
- Use named exports
- Extract business logic to custom hooks in `hooks/`
- Components render UI only

### Custom Hooks

- Extract all business logic from components
- Use `useCallback` for function stability
- In dependency arrays, use `[hookObject.functionName]` ✅
- DO NOT use objects directly in deps: `[hookObject]` ❌

### Error Handling

Always use `extractErrorMessage` from `utils/error.ts`:

```typescript
import { extractErrorMessage } from '@/utils/error';

// Wrap API calls with extractErrorMessage
catch (error) {
  const message = extractErrorMessage(error, 'Default error message');
}
```

Priority: Server response message > error.message > fallback

### Styling

- **ONLY** Tailwind CSS - no inline styles, no CSS modules
- Keep utility classes readable with proper line breaks for long class lists

## Agent Workflow Guidelines

### Local Agents (pickeat_web/.claude/agents/)

Playwright E2E 테스트 관련 에이전트:

| Agent | Purpose |
|-------|---------|
| playwright-test-generator | E2E test generation |
| playwright-test-healer | E2E test debugging |
| playwright-test-planner | E2E test planning |

### Shared Agents (Root: PickEat/.claude/agents/)

| Agent | Purpose |
|-------|---------|
| code-reviewer | Code quality, security review |
| code-quality-manager | Error diagnosis, log analysis, quality management (integrated) |
| refactor-executor | Systematic refactoring |
| api-sync-analyzer | API synchronization analysis |

### Agent Invocation

Agents automatically detect project from file paths:
- Files containing `pickeat_web/` → Frontend rules applied
- Files containing `pick-eat_be/` → Backend rules applied

### When to Use Agents vs Plan Mode

**Use Plan Mode (EnterPlanMode):**
- New feature implementation requiring design decisions
- Multiple valid approaches exist
- Architecture changes need user approval
- Non-trivial tasks affecting 2+ files

**Use Agent Directly:**
- Error occurred → code-quality-manager
- Code written → code-reviewer immediately
- Clear refactoring plan ready → refactor-executor
- API sync check → api-sync-analyzer

## Quality Checklist & Workflow

### Before Writing Code

- Check existing utilities in `utils/`
- Check existing hooks in `hooks/`
- Check existing components in `components/common/`
- Reuse existing code when possible

### While Writing Code

- Follow architecture rules (API in `services/`, state in `slices/`, types in `types/`)
- Use TypeScript properly (no `any`, explicit types)
- Keep components under 300 lines (split if larger)
- Extract business logic to custom hooks
- Use `extractErrorMessage` for all error handling

### After Writing Code (Every Phase)

- `npm run build` must succeed
- Zero TypeScript/ESLint errors
- Remove ALL unused imports/variables/functions
- Test functionality in browser
- Verify documentation matches implementation

**NEVER** proceed to next phase if any item fails. Fix and re-verify first.

### Refactoring Priority

1. Remove duplicate code (extract common functions/hooks, delete originals completely)
2. Split files over 300 lines
3. Remove unused code
4. Replace `any` types
5. Convert relative to absolute imports
6. Remove hardcoded values → move to `utils/constants.ts`

**Refactoring Rules:**
- One file/feature at a time
- NEVER refactor while adding features
- Always check React docs for best practices
- When extracting hooks, ensure `useCallback` for stability
- Original code must be completely deleted when extracted

## Key Utilities

- `utils/constants.ts` - All constants (STORAGE_KEYS, API_CONFIG, VALIDATION, ERROR_MESSAGES, MAP_CONFIG, BUG_REPORT)
- `utils/error.ts` - `extractErrorMessage()` for consistent error handling
- `utils/validation.ts` - Form validation helpers
- `utils/format.ts` - Data formatting utilities
- `utils/jwt.ts` - JWT token parsing and validation
- `utils/naverMap.ts` - Naver Maps integration utilities
- `utils/userSetup.ts` - User initialization and setup helpers
- `utils/cn.ts` - Tailwind CSS class name utility (clsx/tailwind-merge)

## Important Notes

- Development server runs on port 8080
- API base URL configured via `VITE_API_BASE_URL` environment variable
- All routes wrapped in `<AppLayout>` component
- Protected routes use `<ProtectedRoute>` wrapper
- Auth initialization happens in `routes/index.tsx` on mount
