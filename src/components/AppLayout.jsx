import { useState } from 'react'
import { Link, Outlet } from '@tanstack/react-router'
import { useSessao } from '../features/auth/useSessao'
import { sair } from '../features/auth/authApi'
import LoginPage from '../features/auth/LoginPage'
import PerfilModal from '../features/perfil/PerfilModal'

const linkAtivo = { className: 'text-cyan-400' }
const linkInativo = { className: 'text-gray-400 hover:text-gray-100' }

// Itens da navegação, reusados no desktop e no menu mobile. aoNavegar
// fecha o menu mobile ao clicar num item.
function ItensNav({ aoAbrirPerfil, aoNavegar }) {
  return (
    <>
      <Link
        to="/"
        activeOptions={{ exact: true }}
        activeProps={linkAtivo}
        inactiveProps={linkInativo}
        onClick={aoNavegar}
      >
        Equipamentos
      </Link>
      <Link
        to="/dashboard"
        activeProps={linkAtivo}
        inactiveProps={linkInativo}
        onClick={aoNavegar}
      >
        Dashboard
      </Link>
      <button
        onClick={() => {
          aoAbrirPerfil()
          aoNavegar?.()
        }}
        className="text-left text-gray-400 hover:text-gray-100"
      >
        Perfil
      </button>
      <button
        onClick={() => sair()}
        className="text-left text-gray-400 hover:text-gray-100"
      >
        Sair
      </button>
    </>
  )
}

// Casco do app + PORTEIRO: carregando -> "Carregando"; sem sessão ->
// login; logado -> app. Cabeçalho responsivo: nav inline no desktop,
// menu hambúrguer no celular.
export default function AppLayout() {
  const { sessao, carregando } = useSessao()
  const [perfilAberto, setPerfilAberto] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)

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

          {/* Desktop: navegação inline (>= sm) */}
          <nav className="hidden items-center gap-4 text-sm sm:flex">
            <ItensNav aoAbrirPerfil={() => setPerfilAberto(true)} />
          </nav>

          {/* Mobile: botão hambúrguer (< sm) */}
          <button
            onClick={() => setMenuAberto((v) => !v)}
            className="text-2xl leading-none text-gray-300 sm:hidden"
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
          >
            ☰
          </button>
        </div>

        {/* Mobile: menu aberto */}
        {menuAberto && (
          <nav className="flex flex-col gap-3 border-t border-gray-800 px-6 py-3 text-sm sm:hidden">
            <ItensNav
              aoAbrirPerfil={() => setPerfilAberto(true)}
              aoNavegar={() => setMenuAberto(false)}
            />
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-5xl p-6">
        <Outlet />
      </main>

      {perfilAberto && <PerfilModal onClose={() => setPerfilAberto(false)} />}
    </div>
  )
}
