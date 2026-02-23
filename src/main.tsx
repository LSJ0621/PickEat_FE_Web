import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from '@app/store'
import { ErrorBoundary } from '@shared/components/ErrorBoundary'
import { ToastProvider } from '@shared/components/ToastProvider'
import './i18n/config'
import './index.css'
import Routes from '@app/routes'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <ToastProvider>
          <Routes />
        </ToastProvider>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
)
