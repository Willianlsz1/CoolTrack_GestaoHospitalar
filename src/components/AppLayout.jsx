import { Link, Outlet } from '@tanstack/react-router'
import { useSessao } from '../features/auth/useSessao'
import { sair } from '../features/auth/authApi'
import LoginPage from '../features/auth/LoginPage'

// Casco do app + PORTEIRO: enquanto busca a sessão, mostra "Carregando";
// sem sessão, mostra a tela de login; logado, mostra o app com o botão
// Sair. Assim o app inteiro fica protegido num lugar só (não rota a rota).
export default function AppLayout() {
  const { sessao, carregando } = useSessao()

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-400">
        Carregando…
      </div>
    )
  }

  if (!sessao) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold text-cyan-400"
          >
            <span aria-hidden="true">❄</span>
            <span>CoolTrack</span>
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              activeProps={{ className: 'text-cyan-400' }}
              inactiveProps={{ className: 'text-gray-400 hover:text-gray-100' }}
            >
              Equipamentos
            </Link>
            <Link
              to="/dashboard"
              activeProps={{ className: 'text-cyan-400' }}
              inactiveProps={{ className: 'text-gray-400 hover:text-gray-100' }}
            >
              Dashboard
            </Link>
            <button
              onClick={() => sair()}
              className="text-gray-400 hover:text-gray-100"
            >
              Sair
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-6">
        <Outlet />
      </main>
    </div>
  )
}
