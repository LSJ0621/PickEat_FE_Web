import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import { ToastProvider } from './components/common/ToastProvider'
import './i18n/config'
import './index.css'
import Routes from './routes'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ToastProvider>
        <Routes />
      </ToastProvider>
    </Provider>
  </StrictMode>,
)
