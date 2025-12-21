# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript + React + Vite based food recommendation web application. Uses Redux Toolkit for state management, React Router for routing, and Axios for API communication with automatic token refresh.

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
│       ├── auth.ts
│       ├── user.ts
│       ├── menu.ts
│       └── ...
├── components/
│   ├── common/            # Reusable UI components
│   ├── features/          # Feature-specific components
│   │   ├── auth/
│   │   ├── menu/
│   │   └── ...
│   └── layout/            # Layout components
├── pages/                 # Route page components
├── hooks/                 # Custom React hooks (domain-organized)
├── store/
│   ├── index.ts           # Redux store configuration
│   ├── hooks.ts           # Typed Redux hooks (useAppSelector, useAppDispatch)
│   └── slices/            # Redux slices
├── routes/                # React Router configuration
├── types/                 # TypeScript type definitions (domain-organized)
└── utils/                 # Utility functions
    ├── constants.ts       # All hardcoded values
    ├── error.ts           # Error handling utilities
    ├── validation.ts      # Validation helpers
    └── ...
```

**Critical Rules:**
- API calls ONLY in `api/services/` - never in pages or components
- All endpoints in `api/endpoints.ts` - no hardcoded URLs
- State management ONLY in `store/slices/`
- Types ONLY in `types/` - never inline complex types
- Constants ONLY in `utils/constants.ts` - no hardcoding
- Business logic extracted to custom hooks in `hooks/`
- Components handle UI rendering only

### Import Path Conventions

- **ALWAYS** use absolute imports with `@/` alias (configured in vite.config.ts)
- **NEVER** use relative imports (e.g., `../../../components`)
- Use `import type` for type-only imports

```typescript
// ✅ Correct
import { Button } from '@/components/common/Button';
import type { User } from '@/types/user';

// ❌ Wrong
import { Button } from '../../../components/common/Button';
```

## API Client Architecture

### Axios Interceptor Pattern

The API client (`src/api/client.ts`) implements:
- Automatic token injection in request headers
- Automatic token refresh on 401 responses
- Single-flight token refresh (prevents multiple refresh calls)
- Automatic redirect to login on auth failure

**Token Refresh Flow:**
1. Request fails with 401
2. Interceptor checks if it's an auth endpoint (skip refresh for login/register)
3. Calls `getRefreshedToken()` which ensures only one refresh request
4. Updates localStorage with new token
5. Retries original request with new token
6. On refresh failure, clears token and redirects to `/login`

### API Service Pattern

```typescript
// In api/services/user.ts
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { UserResponse } from '@/types/user';

export const updateUser = async (data: UpdateUserRequest): Promise<UserResponse> => {
  const response = await apiClient.put<UserResponse>(ENDPOINTS.USER.UPDATE, data);
  return response.data;
};
```

**Rules:**
- Service functions in `api/services/` domain files
- Function naming: verb + noun (`getUser`, `createAddress`, `deleteOrder`)
- All endpoints from `ENDPOINTS` object - no hardcoded URLs
- Return response.data, not entire response
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
- Components render UI only - no API calls, no complex logic
- File size should stay under 300 lines (split if larger)

### Custom Hooks

- Extract all business logic from components
- Use `useCallback` for function stability
- In dependency arrays, use `[hookObject.functionName]` ✅
- DO NOT use objects directly in deps: `[hookObject]` ❌

### Naming Conventions

- Components: PascalCase (`UserProfile.tsx`)
- Functions/variables: camelCase (`getUserData`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Files: Match their primary export

### Error Handling

Always use `extractErrorMessage` from `utils/error.ts`:

```typescript
import { extractErrorMessage } from '@/utils/error';

try {
  await someApiCall();
} catch (error) {
  const message = extractErrorMessage(error, '기본 에러 메시지');
  // Handle error with message
}
```

Priority: Server response message > error.message > fallback

### Styling

- **ONLY** Tailwind CSS - no inline styles, no CSS modules
- Keep utility classes readable with proper line breaks for long class lists

## Phase-Based Workflow

When implementing features in phases (as indicated in project history):

**After Each Phase:**
1. ✅ Complete all checklist items
2. ✅ Run `npm run build` - must succeed
3. ✅ Check TypeScript errors - must be zero
4. ✅ Check ESLint errors - must be zero
5. ✅ Test functionality in browser
6. ✅ Remove unused imports/variables/functions
7. ✅ Verify documentation matches implementation

**NEVER** proceed to next phase if any item fails. Fix and re-verify first.

## Code Quality Guidelines

**Before Writing New Code:**
- Check for existing utilities in `utils/`
- Check for existing hooks in `hooks/`
- Check for existing components in `components/common/`
- Reuse existing code when possible

**After Writing Code:**
- Remove ALL unused imports, functions, and variables immediately
- If you find duplicate logic, extract to common function/hook
- Search for similar patterns to avoid duplication

**Refactoring Priority:**
1. Remove duplicate code (extract common functions/hooks, delete originals completely)
2. Split files over 300 lines
3. Remove unused code
4. Replace `any` types
5. Convert relative to absolute imports
6. Remove hardcoded values → move to `utils/constants.ts`
7. Standardize error handling

**Refactoring Rules:**
- One file/feature at a time
- NEVER refactor while adding features
- Always check React docs for best practices (useEffect dependencies, cleanup, hook patterns)
- When extracting hooks, ensure `useCallback` for stability
- Original code must be completely deleted when extracted

## Key Utilities

- `utils/constants.ts` - All constants (STORAGE_KEYS, API_CONFIG, VALIDATION, ERROR_MESSAGES, MAP_CONFIG, BUG_REPORT)
- `utils/error.ts` - `extractErrorMessage()` for consistent error handling
- `utils/validation.ts` - Form validation helpers
- `utils/format.ts` - Data formatting utilities

## Important Notes

- Development server runs on port 8080
- API base URL configured via `VITE_API_BASE_URL` environment variable
- Google Maps API key injected via `vite-plugin-html` in `index.html`
- All routes wrapped in `<AppLayout>` component
- Protected routes use `<ProtectedRoute>` wrapper
- Auth initialization happens in `routes/index.tsx` on mount
