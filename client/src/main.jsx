import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import SideBarOpenProvider from './Context/SideBarOpenProvider.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'
import AuthLoader from './Context/AuthLoader.jsx'
import SocketProvider from './Context/SocketProvder.jsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <SocketProvider>
            <SideBarOpenProvider>
              <AuthLoader>
                <App />
              </AuthLoader>
            </SideBarOpenProvider>
          </SocketProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
)
