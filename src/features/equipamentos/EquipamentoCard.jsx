import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { TIPO_LABELS } from './rotulos'
import { nomeSetorDoEquipamento } from '../../core/dominio'
import { StatusBadge } from '../../components/StatusBadge'
import { MiniaturaEquipamento } from './MiniaturaEquipamento'

// Cartão de equipamento para o celular (< sm): a área toda é tocável e leva
// à ficha. Substitui a tabela com scroll horizontal no mobile.
export function EquipamentoCard({ eq }) {
  const nomeSetor = nomeSetorDoEquipamento(eq)
  const localizacao = nomeSetor
    ? `${nomeSetor}${eq.andar ? ` · ${eq.andar}` : ''}`
    : '—'

  return (
    <li>
      <Link
        to="/equipamentos/$id"
        params={{ id: eq.id }}
        className="flex items-center gap-3 rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)] p-3"
        style={{ color: 'inherit', textDecoration: 'none' }}
      >
        <MiniaturaEquipamento eq={eq} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-[var(--fg)]">{eq.nome}</div>
          <div className="t-caption truncate">
            {TIPO_LABELS[eq.tipo] ?? eq.tipo} · {localizacao}
          </div>
        </div>
        <StatusBadge status={eq.status} />
        <ChevronRight size={20} className="flex-none text-[var(--fg-3)]" />
      </Link>
    </li>
  )
}
