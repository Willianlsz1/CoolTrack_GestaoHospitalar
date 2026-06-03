import { useState } from 'react'
import { Link, Outlet } from '@tanstack/react-router'
import {
  Snowflake,
  Boxes,
  LayoutDashboard,
  Route,
  FileText,
  ListChecks,
  ClipboardCheck,
  MapPin,
  UserPlus,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useSessao } from '../features/auth/useSessao'
import { useEhAdmin } from '../features/perfil/useEhAdmin'
import { usePendentesAprovacao } from '../features/aprovacoes/usePendentesAprovacao'
import { sair } from '../features/auth/authApi'
import LoginPage from '../features/auth/LoginPage'
import PerfilModal from '../features/perfil/PerfilModal'

// Itens de navegação (ordem do menu). adminOnly esconde de quem não é admin;
// exact marca o link da raiz (só ativo em "/"). A trava real é sempre o RLS.
const ITENS_NAV = [
  { to: '/', label: 'Equipamentos', icon: Boxes, exact: true },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ronda', label: 'Ronda', icon: Route },
  { to: '/relatorio', label: 'Relatório', icon: FileText },
  {
    to: '/aprovacoes',
    label: 'Aprovações',
    icon: ClipboardCheck,
    adminOnly: true,
  },
  { to: '/checklists', label: 'Checklists', icon: ListChecks, adminOnly: true },
  { to: '/setores', label: 'Setores', icon: MapPin, adminOnly: true },
  { to: '/usuarios', label: 'Usuários', icon: UserPlus, adminOnly: true },
]

// Itens da navegação, reusados no desktop e no menu mobile. aoNavegar
// fecha o menu mobile ao clicar num item.
function ItensNav({ aoAbrirPerfil, aoNavegar, ehAdmin, pendentes }) {
  return (
    <>
      {ITENS_NAV.filter((i) => !i.adminOnly || ehAdmin).map((item) => {
        const Icone = item.icon
        const badge = item.to === '/aprovacoes' && pendentes > 0
        return (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={item.exact ? { exact: true } : undefined}
            className="ct-nav"
            activeProps={{ className: 'is-active' }}
            onClick={aoNavegar}
          >
            <Icone size={16} /> {item.label}
            {badge && (
              <span
                className="ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 text-[11px] font-medium text-[var(--bg)]"
                style={{ background: 'var(--warn)' }}
                aria-label={`${pendentes} aguardando aprovação`}
              >
                {pendentes}
              </span>
            )}
          </Link>
        )
      })}
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
  const { data: pendentes = 0 } = usePendentesAprovacao(ehAdmin)
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
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-[19px] font-medium text-[var(--fg)]"
          >
            <Snowflake size={20} style={{ color: 'var(--link)' }} />
            <span>CoolTrack</span>
          </Link>

          {/* Desktop: navegação inline (>= sm) */}
          <nav className="hidden items-center gap-6 sm:flex">
            <ItensNav
              aoAbrirPerfil={() => setPerfilAberto(true)}
              ehAdmin={ehAdmin}
              pendentes={pendentes}
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
              pendentes={pendentes}
            />
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-[1440px] p-6">
        <Outlet />
      </main>

      {perfilAberto && <PerfilModal onClose={() => setPerfilAberto(false)} />}
    </div>
  )
}
