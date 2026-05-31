import { useState } from 'react'
import { Link, Outlet } from '@tanstack/react-router'
import {
  Snowflake,
  Boxes,
  LayoutDashboard,
  FileText,
  ListChecks,
  MapPin,
  UserPlus,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useSessao } from '../features/auth/useSessao'
import { useEhAdmin } from '../features/perfil/useEhAdmin'
import { sair } from '../features/auth/authApi'
import LoginPage from '../features/auth/LoginPage'
import PerfilModal from '../features/perfil/PerfilModal'

// Itens da navegação, reusados no desktop e no menu mobile. aoNavegar
// fecha o menu mobile ao clicar num item.
function ItensNav({ aoAbrirPerfil, aoNavegar, ehAdmin }) {
  return (
    <>
      <Link
        to="/"
        activeOptions={{ exact: true }}
        className="ct-nav"
        activeProps={{ className: 'is-active' }}
        onClick={aoNavegar}
      >
        <Boxes size={16} /> Equipamentos
      </Link>
      <Link
        to="/dashboard"
        className="ct-nav"
        activeProps={{ className: 'is-active' }}
        onClick={aoNavegar}
      >
        <LayoutDashboard size={16} /> Dashboard
      </Link>
      <Link
        to="/relatorio"
        className="ct-nav"
        activeProps={{ className: 'is-active' }}
        onClick={aoNavegar}
      >
        <FileText size={16} /> Relatório
      </Link>
      {ehAdmin && (
        <Link
          to="/checklists"
          className="ct-nav"
          activeProps={{ className: 'is-active' }}
          onClick={aoNavegar}
        >
          <ListChecks size={16} /> Checklists
        </Link>
      )}
      {ehAdmin && (
        <Link
          to="/setores"
          className="ct-nav"
          activeProps={{ className: 'is-active' }}
          onClick={aoNavegar}
        >
          <MapPin size={16} /> Setores
        </Link>
      )}
      {ehAdmin && (
        <Link
          to="/usuarios"
          className="ct-nav"
          activeProps={{ className: 'is-active' }}
          onClick={aoNavegar}
        >
          <UserPlus size={16} /> Usuários
        </Link>
      )}
      <button
        type="button"
        onClick={() => {
          aoAbrirPerfil()
          aoNavegar?.()
        }}
        className="ct-nav"
      >
        <User size={16} /> Perfil
      </button>
      <button type="button" onClick={() => sair()} className="ct-nav">
        <LogOut size={16} /> Sair
      </button>
    </>
  )
}

// Casco do app + PORTEIRO: carregando -> "Carregando"; sem sessão ->
// login; logado -> app. Cabeçalho responsivo: nav inline no desktop,
// menu hambúrguer no celular.
export default function AppLayout() {
  const { sessao, carregando } = useSessao()
  const { ehAdmin } = useEhAdmin()
  const [perfilAberto, setPerfilAberto] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--fg-2)]">
        Carregando…
      </div>
    )
  }

  if (!sessao) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-[18px] font-medium text-[var(--fg)]"
          >
            <Snowflake size={20} style={{ color: 'var(--link)' }} />
            <span>CoolTrack</span>
          </Link>

          {/* Desktop: navegação inline (>= sm) */}
          <nav className="hidden items-center gap-6 sm:flex">
            <ItensNav
              aoAbrirPerfil={() => setPerfilAberto(true)}
              ehAdmin={ehAdmin}
            />
          </nav>

          {/* Mobile: botão hambúrguer (< sm) */}
          <button
            type="button"
            onClick={() => setMenuAberto((v) => !v)}
            className="text-[var(--fg-2)] hover:text-[var(--fg)] sm:hidden"
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
          >
            {menuAberto ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile: menu aberto */}
        {menuAberto && (
          <nav className="flex flex-col items-start gap-3 border-t border-[var(--border)] px-6 py-3 sm:hidden">
            <ItensNav
              aoAbrirPerfil={() => setPerfilAberto(true)}
              aoNavegar={() => setMenuAberto(false)}
              ehAdmin={ehAdmin}
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
