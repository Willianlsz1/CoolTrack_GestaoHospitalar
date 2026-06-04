import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { XCircle, ChevronRight } from 'lucide-react'
import { nomeSetorDoEquipamento } from '../../core/dominio'

// Card do DASHBOARD do técnico: serviços que ele registrou e o gestor reprovou.
// Cada linha leva à ficha do equipamento, onde o motivo aparece — preventiva
// abre na aba Checklist; os demais tipos, na aba Serviços (padrão).
const LIMITE = 5

function destino(m) {
  return {
    to: '/equipamentos/$id',
    params: { id: m.equipamento_id },
    search: m.tipo === 'preventiva' ? { aba: 'checklist' } : {},
  }
}

export function ReprovadosCard({ itens }) {
  const [mostrarTodos, setMostrarTodos] = useState(false)
  const visiveis = mostrarTodos ? itens : itens.slice(0, LIMITE)

  return (
    <article className="flex flex-col rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)] px-[22px] py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-[10px]">
          <XCircle size={18} style={{ color: 'var(--danger)' }} />
          <div>
            <h2 className="text-[17px] font-medium">Serviços reprovados</h2>
            <div className="t-caption mt-0.5">
              Corrija e registre de novo — veja o motivo na ficha
            </div>
          </div>
        </div>
        <div
          className="text-[40px] font-medium leading-none tracking-[-0.02em]"
          style={{ color: 'var(--danger)' }}
        >
          {itens.length}
        </div>
      </div>

      <ul className="m-0 mt-2 list-none p-0">
        {visiveis.map((m) => (
          <li
            key={m.id}
            className="border-t border-[var(--border)] first:border-t-0"
          >
            <Link
              {...destino(m)}
              className="-mx-[10px] flex items-center gap-3 rounded-[var(--r)] px-[10px] py-1.5 hover:bg-[var(--surface-2)]"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              <div className="min-w-0 flex-1">
                <div className="text-[15px] text-[var(--fg)]">
                  {m.equipamentos?.nome ?? 'Equipamento removido'}
                </div>
                <div className="t-caption">
                  {[
                    m.equipamentos && nomeSetorDoEquipamento(m.equipamentos),
                    m.aprovacao_motivo,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
              </div>
              <ChevronRight
                size={16}
                className="flex-none text-[var(--fg-3)]"
              />
            </Link>
          </li>
        ))}
      </ul>

      {itens.length > LIMITE && (
        <div className="mt-auto pt-[10px]">
          <button
            type="button"
            onClick={() => setMostrarTodos((v) => !v)}
            className="text-[14px] text-[var(--link)]"
          >
            {mostrarTodos ? 'Ver menos' : `Ver todos os ${itens.length}`}
          </button>
        </div>
      )}
    </article>
  )
}
