import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight, ArrowRight } from 'lucide-react'
import { IconeTipo } from '../equipamentos/iconesTipo'
import { nomeSetorDoEquipamento } from '../../core/dominio'
import { pluralDias } from '../../core/data'
import { DIAS_CRITICO } from './dashboardAgregacoes'

// Card de alerta reutilizável (danger/warn): título + número grande +
// lista de equipamentos (ícone do tipo, nome, setor·sala, "X dias",
// chevron). Cada linha leva à ficha. "Ver todos" expande a lista ali mesmo.
const COR = { danger: 'var(--danger)', warn: 'var(--warn)' }
const LIMITE = 5

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
  acao,
}) {
  const cor = COR[variant]
  const [mostrarTodos, setMostrarTodos] = useState(false)
  const visiveis = mostrarTodos ? itens : itens.slice(0, LIMITE)
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

      {itens.length === 0 ? (
        <p className="t-caption mt-2">Nenhum equipamento — tudo em dia.</p>
      ) : (
        <ul className="m-0 mt-2 list-none p-0">
          {visiveis.map(({ eq, dias }) => (
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
                {variant === 'danger' && dias >= DIAS_CRITICO && (
                  <span
                    className="ml-auto rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide"
                    style={{
                      color: 'var(--danger)',
                      borderColor: 'var(--danger-border)',
                    }}
                  >
                    Crítico
                  </span>
                )}
                <span
                  className={`whitespace-nowrap text-[14px] ${
                    variant === 'danger' && dias >= DIAS_CRITICO
                      ? ''
                      : 'ml-auto'
                  }`}
                  style={{ color: cor }}
                >
                  {variant === 'warn' && dias === 0
                    ? 'vence hoje'
                    : pluralDias(dias)}
                </span>
                <ChevronRight
                  size={16}
                  className="flex-none text-[var(--fg-3)]"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Rodapé: expandir a lista (sem navegar) e/ou a ação (ex.: ir à ronda).
          Só aparece quando há o que mostrar. */}
      {(itens.length > LIMITE || (acao && itens.length > 0)) && (
        <div className="mt-auto flex items-center justify-between gap-3 pt-[10px]">
          {itens.length > LIMITE ? (
            <button
              type="button"
              onClick={() => setMostrarTodos((v) => !v)}
              className="text-[14px] text-[var(--link)]"
            >
              {mostrarTodos ? 'Ver menos' : `Ver todos os ${total}`}
            </button>
          ) : (
            <span />
          )}
          {acao && itens.length > 0 && (
            <Link
              to={acao.to}
              className="inline-flex items-center gap-1 text-[14px] text-[var(--link)]"
            >
              {acao.label}
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      )}
    </article>
  )
}
