import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Boxes,
  ScanQrCode,
  LayoutDashboard,
  Footprints,
  FileText,
  ClipboardCheck,
  ListChecks,
  Map,
  Users,
  FileCog,
  ShieldCheck,
  ChevronDown,
  CircleUser,
  User,
  LogOut,
} from 'lucide-react'
import { useSair } from '../features/auth/useSair'

// Itens sempre visíveis na barra (Aprovações é admin, mas fica no topo pelo
// badge de pendentes). adminOnly esconde de quem não é admin; exact marca o
// link da raiz. A trava real é sempre o RLS.
const ITENS_TOPO = [
  { to: '/', label: 'Equipamentos', icon: Boxes, exact: true },
  { to: '/escanear', label: 'Escanear', icon: ScanQrCode },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ronda', label: 'Ronda', icon: Footprints },
  { to: '/relatorio', label: 'Relatório', icon: FileText },
  {
    to: '/aprovacoes',
    label: 'Aprovações',
    icon: ClipboardCheck,
    adminOnly: true,
  },
]

// Itens agrupados sob "Administração" (todos admin-only).
const ITENS_ADMIN = [
  { to: '/checklists', label: 'Checklists', icon: ListChecks },
  { to: '/setores', label: 'Setores', icon: Map },
  { to: '/usuarios', label: 'Usuários', icon: Users },
  { to: '/config-pmoc', label: 'Config PMOC', icon: FileCog },
]

function BadgePendentes({ n }) {
  return (
    <span
      className="ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 text-[11px] font-medium text-[var(--bg)]"
      style={{ background: 'var(--warn)' }}
      aria-label={`${n} aguardando aprovação`}
    >
      {n}
    </span>
  )
}

function NavLink({ item, pendentes, aoNavegar }) {
  const Icone = item.icon
  return (
    <Link
      to={item.to}
      activeOptions={item.exact ? { exact: true } : undefined}
      className="ct-nav"
      activeProps={{ className: 'is-active' }}
      onClick={aoNavegar}
    >
      <Icone size={16} /> {item.label}
      {item.to === '/aprovacoes' && pendentes > 0 && (
        <BadgePendentes n={pendentes} />
      )}
    </Link>
  )
}

// Dropdown do menu (desktop). Acessível: aria-expanded, fecha no Esc e ao
// clicar fora; clicar num item também fecha.
function NavDropdown({ label, icon: Icone, children }) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!aberto) return
    const onMouse = (e) => {
      if (!ref.current?.contains(e.target)) setAberto(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setAberto(false)
    }
    document.addEventListener('mousedown', onMouse)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouse)
      document.removeEventListener('keydown', onKey)
    }
  }, [aberto])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="ct-nav"
        aria-haspopup="true"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
      >
        {Icone && <Icone size={16} />} {label}
        <ChevronDown
          size={16}
          className={`transition-transform ${aberto ? 'rotate-180' : ''}`}
        />
      </button>
      {aberto && (
        <div
          role="menu"
          onClick={() => setAberto(false)}
          className="absolute right-0 top-full z-30 mt-2 flex min-w-[200px] flex-col rounded-[var(--r)] border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow-modal)]"
        >
          {children}
        </div>
      )}
    </div>
  )
}

function ItemDropdown({ item }) {
  const Icone = item.icon
  return (
    <Link
      to={item.to}
      className="ct-menu-item"
      activeProps={{ className: 'is-active' }}
    >
      <Icone size={16} /> {item.label}
    </Link>
  )
}

// Navegação do desktop (>= sm): itens de topo + dropdowns Administração e Perfil.
export function NavDesktop({ ehAdmin, pendentes, aoAbrirPerfil }) {
  const sairComFeedback = useSair()
  return (
    <>
      {ITENS_TOPO.filter((i) => !i.adminOnly || ehAdmin).map((item) => (
        <NavLink key={item.to} item={item} pendentes={pendentes} />
      ))}
      {/* Separa a OPERAÇÃO (acima) da GESTÃO (Administração/Perfil). */}
      <span
        aria-hidden="true"
        className="mx-1 h-5 w-px self-center bg-[var(--border)]"
      />
      {ehAdmin && (
        <NavDropdown label="Administração" icon={ShieldCheck}>
          {ITENS_ADMIN.map((item) => (
            <ItemDropdown key={item.to} item={item} />
          ))}
        </NavDropdown>
      )}
      <NavDropdown label="Perfil" icon={CircleUser}>
        <button type="button" className="ct-menu-item" onClick={aoAbrirPerfil}>
          <User size={16} /> Meu perfil
        </button>
        <button
          type="button"
          className="ct-menu-item"
          onClick={sairComFeedback}
        >
          <LogOut size={16} /> Sair
        </button>
      </NavDropdown>
    </>
  )
}

// Navegação do mobile (< sm): lista vertical achatada, com um rótulo de seção
// separando os itens de administração (dropdown não faz sentido na lista).
export function NavMobile({ ehAdmin, pendentes, aoAbrirPerfil, aoNavegar }) {
  const sairComFeedback = useSair()
  return (
    <>
      {ITENS_TOPO.filter((i) => !i.adminOnly || ehAdmin).map((item) => (
        <NavLink
          key={item.to}
          item={item}
          pendentes={pendentes}
          aoNavegar={aoNavegar}
        />
      ))}
      {ehAdmin && (
        <>
          <div className="mt-1 px-[10px] text-[12px] uppercase tracking-wide text-[var(--fg-3)]">
            Administração
          </div>
          {ITENS_ADMIN.map((item) => (
            <NavLink key={item.to} item={item} aoNavegar={aoNavegar} />
          ))}
        </>
      )}
      <button
        type="button"
        className="ct-nav"
        onClick={() => {
          aoAbrirPerfil()
          aoNavegar?.()
        }}
      >
        <CircleUser size={16} /> Perfil
      </button>
      <button type="button" className="ct-nav" onClick={sairComFeedback}>
        <LogOut size={16} /> Sair
      </button>
    </>
  )
}
