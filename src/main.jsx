import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import './index.css'
import { router } from './routes/router.jsx'
import { AuthProvider } from './features/auth/AuthProvider.jsx'
import { ToastProvider } from './features/feedback/ToastProvider.jsx'

// O "cérebro" do TanStack Query: guarda o cache de todas as queries.
// Criado UMA vez, fora do componente, para não recriar a cada render.
// staleTime de 30s evita re-baixar a mesma query a cada navegação curta entre
// telas; mutações invalidam e forçam atualização mesmo dentro da janela.
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
