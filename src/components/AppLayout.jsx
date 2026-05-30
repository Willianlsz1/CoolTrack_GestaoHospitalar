import { Link, Outlet } from '@tanstack/react-router'

// Casco do app: cabeçalho com marca + navegação, e o conteúdo da rota
// atual abaixo (via <Outlet/>). Envolve TODAS as telas (é a rota raiz).
// Cada área nova (Manutenções, Dashboard...) entra como um <Link> no nav.
export default function AppLayout() {
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

          <nav className="flex gap-4 text-sm">
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
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-6">
        <Outlet />
      </main>
    </div>
  )
}
