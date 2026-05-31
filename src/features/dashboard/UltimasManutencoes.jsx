import { Wrench } from 'lucide-react'
import { IconeTipo } from '../equipamentos/iconesTipo'
import { TipoManutencaoBadge } from '../../components/TipoManutencaoBadge'
import { formatarDiaMes } from '../../core/data'

// Nível 3 — últimas manutenções (ícone do tipo, nome, setor·técnico,
// badge de tipo, data). Usa os dados relacionados (equipamentos, perfis).
export function UltimasManutencoes({ manutencoes }) {
  return (
    <article className="flex min-h-0 flex-col rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)] px-[22px] py-[18px]">
      <p className="mb-[10px] flex items-center gap-2 text-[13px] text-[var(--fg-3)]">
        <Wrench size={14} /> Últimas manutenções
      </p>
      {manutencoes.length === 0 ? (
        <p className="t-secondary">Nenhuma manutenção registrada.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {manutencoes.map((m) => {
            const sub = [m.equipamentos?.setores?.nome, m.perfis?.nome]
              .filter(Boolean)
              .join(' · ')
            return (
              <li
                key={m.id}
                className="flex items-center gap-4 border-t border-[var(--border)] py-[9px] first:border-t-0"
              >
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-[var(--r)] bg-[var(--surface-2)] text-[var(--fg-3)]">
                  <IconeTipo tipo={m.equipamentos?.tipo} size={17} />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[14px] text-[var(--fg)]">
                    {m.equipamentos?.nome ?? '—'}
                  </div>
                  <div className="t-caption">{sub || '—'}</div>
                </div>
                <span className="ml-auto">
                  <TipoManutencaoBadge tipo={m.tipo} />
                </span>
                <span className="mono whitespace-nowrap text-[13px] text-[var(--fg-3)]">
                  {formatarDiaMes(m.data)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </article>
  )
}
