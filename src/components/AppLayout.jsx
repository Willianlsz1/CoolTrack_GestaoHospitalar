import { useState, Suspense } from 'react'
import { Link, Outlet } from '@tanstack/react-router'
import { Snowflake, Menu, X, Loader2 } from 'lucide-react'
import { useSessao } from '../features/auth/useSessao'
import { useEhAdmin } from '../features/perfil/useEhAdmin'
import { useMeuPerfil } from '../features/perfil/useMeuPerfil'
import { usePendentesAprovacao } from '../features/aprovacoes/usePendentesAprovacao'
import LoginPage from '../features/auth/LoginPage'
import TrocaSenhaObrigatoria from '../features/auth/TrocaSenhaObrigatoria'
import PerfilModal from '../features/perfil/PerfilModal'
import { BannerModoDemo } from './BannerModoDemo'
import { Carregando } from './Estado'
import { NavDesktop, NavMobile } from './NavMenu'

// Casco do app + PORTEIRO: carregando -> "Carregando"; sem sessão ->
// login; senha ainda temporária -> troca obrigatória; logado -> app.
// Cabeçalho responsivo: nav inline no desktop, menu hambúrguer no celular.
export default function AppLayout() {
  const { sessao, carregando } = useSessao()
  const { ehAdmin } = useEhAdmin()
  const { data: perfil } = useMeuPerfil()
  const { data: pendentes = 0 } = usePendentesAprovacao(ehAdmin)
  const [perfilAberto, setPerfilAberto] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)

  if (carregando) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-screen items-center justify-center gap-2 bg-[var(--bg)] text-[var(--fg-2)]"
      >
        <Loader2 size={20} className="animate-spin" aria-hidden="true" />
        Carregando…
      </div>
    )
  }

  if (!sessao) {
    return <LoginPage />
  }

  // Senha ainda é a temporária que o admin criou (0029). Só barra quando o
  // perfil JÁ carregou: se a query falhar ou estiver em voo, o app segue —
  // travar todo mundo por causa de uma consulta lenta seria pior que o risco
  // que esta tela evita.
  if (perfil && !perfil.senha_trocada_em) {
    return <TrocaSenhaObrigatoria />
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <BannerModoDemo />
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
          <nav className="hidden items-center gap-1 sm:flex">
            <NavDesktop
              ehAdmin={ehAdmin}
              pendentes={pendentes}
              aoAbrirPerfil={() => setPerfilAberto(true)}
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
            {menuAberto ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile: menu aberto */}
        {menuAberto && (
          <nav className="flex flex-col items-stretch gap-1 border-t border-[var(--border)] px-4 py-3 sm:hidden">
            <NavMobile
              ehAdmin={ehAdmin}
              pendentes={pendentes}
              aoAbrirPerfil={() => setPerfilAberto(true)}
              aoNavegar={() => setMenuAberto(false)}
            />
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-[1440px] p-6">
        <Suspense fallback={<Carregando />}>
          <Outlet />
        </Suspense>
      </main>

      {perfilAberto && <PerfilModal onClose={() => setPerfilAberto(false)} />}
    </div>
  )
}
