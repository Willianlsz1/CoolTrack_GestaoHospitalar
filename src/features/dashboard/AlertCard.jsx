import { Link } from '@tanstack/react-router'
import { ChevronRight, ArrowRight } from 'lucide-react'
import { IconeTipo } from '../equipamentos/iconesTipo'
import { nomeSetorDoEquipamento } from '../../core/dominio'

// Card de alerta reutilizável (danger/warn): título + número grande +
// lista de equipamentos (ícone do tipo, nome, setor·sala, "X dias",
// chevron). Cada linha leva à ficha. Rodapé "Ver todos" se houver mais.
const COR = { danger: 'var(--danger)', warn: 'var(--warn)' }

function localizacao(eq) {
  const nomeSetor = nomeSetorDoEquipamento(eq)
  const detalhe = eq.sala || eq.andar
  if (!nomeSetor) return '—'
  return detalhe ? `${nomeSetor} · ${detalhe}` : nomeSetor
}

export function AlertCard({
  variant,
  icon: Icone,
  titulo,
  hint,
  total,
  itens,
}) {
  const cor = COR[variant]
  return (
    <article className="flex flex-col rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)] px-[22px] py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-[10px]">
          <Icone size={18} style={{ color: cor }} />
          <div>
            <h2 className="text-[17px] font-medium">{titulo}</h2>
            <div className="t-caption mt-0.5">{hint}</div>
          </div>
        </div>
        <div
          className="text-[40px] font-medium leading-none tracking-[-0.02em]"
          style={{ color: cor }}
        >
          {total}
        </div>
      </div>

      <ul className="m-0 mt-2 list-none p-0">
        {itens.map(({ eq, dias }) => {
          return (
            <li
              key={eq.id}
              className="border-t border-[var(--border)] first:border-t-0"
            >
              <Link
                to="/equipamentos/$id"
                params={{ id: eq.id }}
                className="-mx-[10px] flex items-center gap-3 rounded-[var(--r)] px-[10px] py-1 hover:bg-[var(--surface-2)]"
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                <IconeTipo
                  tipo={eq.tipo}
                  size={17}
                  className="flex-none text-[var(--fg-3)]"
                />
                <div className="min-w-0">
                  <div className="text-[15px] text-[var(--fg)]">{eq.nome}</div>
                  <div className="t-caption">{localizacao(eq)}</div>
                </div>
                <span
                  className="ml-auto whitespace-nowrap text-[14px]"
                  style={{ color: cor }}
                >
                  {dias} {dias === 1 ? 'dia' : 'dias'}
                </span>
                <ChevronRight
                  size={16}
                  className="flex-none text-[var(--fg-3)]"
                />
              </Link>
            </li>
          )
        })}
      </ul>

      {total > itens.length && (
        <div className="mt-auto pt-[10px]">
          {/* TODO: levar a uma lista filtrada por este alerta. */}
          <Link
            to="/"
            className="inline-flex items-center gap-[5px] text-[14px] text-[var(--link)]"
          >
            Ver todos os {total} equipamentos <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </article>
  )
}
