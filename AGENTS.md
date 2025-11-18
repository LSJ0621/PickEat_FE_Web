# Repository Guidelines

## Project Structure & Module Organization
Pickeat Web is a Vite + React + TypeScript app. Application code lives in `src`, with feature APIs under `src/api` (axios client, endpoint registry, domain services). Shared UI sits in `src/components/common`, feature-specific UI under `src/components/features`, route-level screens inside `src/pages`, and Redux logic centralized in `src/store` (typed hooks in `store/hooks.ts`, slices in `store/slices`). Routing is handled via `src/routes`, custom hooks in `src/hooks`, utility helpers in `src/utils`, and global types in `src/types`. Static assets belong in `src/assets`, while public icons and manifest files stay inside `public`. Use the `@/*` path alias (configured in `tsconfig.app.json`) for imports such as `import MenuPage from '@/pages/Menu'`.

## Build, Test, and Development Commands
- `npm install` – restore dependencies before any task.
- `npm run dev` – start the Vite dev server with HMR at http://localhost:5173.
- `npm run build` – type-check via `tsc -b` and emit optimized production assets under `dist`.
- `npm run preview` – serve the most recent build for smoke testing.
- `npm run lint` – run the ESLint flat config across `src` and fail on unresolved warnings.

## Coding Style & Naming Conventions
TypeScript strict mode is enabled; prefer explicit interfaces and avoid `any`. Use 2-space indentation, single quotes, arrow functions, and React functional components. Components are PascalCase (`MenuList`), hooks camelCase prefixed with `use` (`useAuthRedirect`), and Redux slices as `<domain>Slice`. Files in `src/pages` should mirror route names; keep styling in Tailwind utility classes declared in `index.css` or component-local layers. Lint rules from `eslint.config.js`—JS + TS recommended presets with React Hooks and Refresh—are the source of truth. Keep imports sorted by feature depth and favor the `@` alias instead of brittle relative paths.

## Testing Guidelines
No automated runner is wired up yet; until Vitest/React Testing Library land, rely on manual QA flows in `npm run dev` and request reviewer validation for risky paths (auth, ordering, payments). When adding tests, colocate files as `<Component>.test.tsx` next to the implementation or inside a local `__tests__` directory. Cover reducers and hooks with deterministic inputs, mock Axios services for API edges, and document any coverage gaps in the PR description.

## Commit & Pull Request Guidelines
Adopt Conventional Commits so reviewers can filter work quickly: `feat(store): add cart slice`, `fix(routes): guard checkout page`, `chore(api): update base URL`. Keep subjects under 72 characters and add a body when context is needed. Each PR should include a summary, linked issue, screenshots or screen recordings for UI work, and the commands executed (`npm run lint`, `npm run build`, manual smoke tests). Group related changes per PR and split refactors from feature work to keep reviews focused.
