import { configureStore } from '@reduxjs/toolkit';
import { render, type RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import type { ReactElement, PropsWithChildren } from 'react';
import authReducer from '@app/store/slices/authSlice';
import agentReducer from '@app/store/slices/agentSlice';
import userDataReducer from '@app/store/slices/userDataSlice';
import type { RootState } from '@app/store';
import { ToastProvider } from '@shared/components/ToastProvider';

// Create a test store with optional preloaded state
export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      agent: agentReducer,
      userData: userDataReducer,
    },
    preloadedState: preloadedState as RootState,
  });
}

export type AppStore = ReturnType<typeof setupStore>;

// Extended render options interface
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
  route?: string;
  useMemoryRouter?: boolean;
}

/**
 * Renders a component with all necessary providers (Redux, Router, Toast)
 * Use this for testing components that depend on these contexts
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    store = setupStore(preloadedState),
    route = '/',
    useMemoryRouter = false,
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren) {
    const Router = useMemoryRouter ? MemoryRouter : BrowserRouter;
    const routerProps = useMemoryRouter ? { initialEntries: [route] } : {};

    return (
      <Provider store={store}>
        <Router {...routerProps}>
          <ToastProvider>{children}</ToastProvider>
        </Router>
      </Provider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Renders a component with only Redux provider
 * Use this for testing components that only need Redux state
 */
export function renderWithRedux(
  ui: ReactElement,
  {
    preloadedState,
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>;
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Renders a component with only Router provider
 * Use this for testing components that only need routing
 */
export function renderWithRouter(
  ui: ReactElement,
  {
    route = '/',
    useMemoryRouter = true,
    ...renderOptions
  }: Omit<ExtendedRenderOptions, 'preloadedState' | 'store'> = {}
) {
  function Wrapper({ children }: PropsWithChildren) {
    if (useMemoryRouter) {
      return <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>;
    }
    return <BrowserRouter>{children}</BrowserRouter>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Creates a wrapper component with Redux Provider for use with renderHook
 * Use this when testing hooks that need Redux store
 */
export function createWrapper(options: { store?: AppStore } = {}) {
  const store = options.store || setupStore();
  return ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
}

// Re-export everything from @testing-library/react
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
