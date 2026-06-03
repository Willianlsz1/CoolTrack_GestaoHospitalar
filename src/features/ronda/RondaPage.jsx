import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight, ScanLine } from 'lucide-react'
import { useEquipamentos } from '../equipamentos/useEquipamentos'
import { useTodasManutencoes } from '../dashboard/useTodasManutencoes'
import { TIPO_LABELS } from '../equipamentos/rotulos'
import { IconeTipo } from '../equipamentos/iconesTipo'
import { montarRonda } from './ronda'
import { Carregando, Erro } from '../../components/Estado'

export default function RondaPage() {
  const eqQuery = useEquipamentos()
  const manQuery = useTodasManutencoes()
  const [soPendentes, setSoPendentes] = useState(true)

  if (eqQuery.isPending || manQuery.isPending) {
    return <Carregando />
  }
  if (eqQuery.isError || manQuery.isError) {
    return <Erro>Erro ao carregar os dados.</Erro>
  }

  const { setores, totalPendentes } = montarRonda(
    eqQuery.data,
    manQuery.data,
    soPendentes,
  )

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1>Ronda do mês</h1>
          <p className="t-secondary mt-1">
            {totalPendentes} equipamento{totalPendentes === 1 ? '' : 's'} com
            checklist pendente.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-[14px] text-[var(--fg-2)]">
            <input
              type="checkbox"
              checked={soPendentes}
              onChange={(e) => setSoPendentes(e.target.checked)}
            />
            Só pendentes
          </label>
          <Link to="/escanear" className="ct-btn ct-btn--secondary">
            <ScanLine size={16} />
            Escanear
          </Link>
        </div>
      </div>

      {setores.length === 0 && (
        <p className="t-secondary">
          {soPendentes
            ? 'Nenhum checklist pendente — tudo em dia. 🎉'
            : 'Nenhum equipamento cadastrado.'}
        </p>
      )}

      <div className="space-y-5">
        {setores.map(({ setor, itens }) => (
          <section key={setor}>
            <h2 className="mb-2 text-[14px] text-[var(--fg-3)]">
              {setor} · {itens.length}
            </h2>
            <ul className="overflow-hidden rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)]">
              {itens.map(({ eq, status }) => (
                <li
                  key={eq.id}
                  className="border-b border-[var(--border)] last:border-b-0"
                >
                  <Link
                    to="/equipamentos/$id"
                    params={{ id: eq.id }}
                    search={{ aba: 'checklist', origem: 'ronda' }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-2)]"
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    <IconeTipo
                      tipo={eq.tipo}
                      size={18}
                      className="flex-none text-[var(--fg-3)]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15px] text-[var(--fg)]">
                        {eq.nome}
                      </div>
                      <div className="t-caption">
                        {TIPO_LABELS[eq.tipo] ?? eq.tipo}
                      </div>
                    </div>
                    <span
                      className="whitespace-nowrap text-[14px]"
                      style={{ color: status.cor }}
                    >
                      {status.label}
                    </span>
                    <ChevronRight
                      size={16}
                      className="flex-none text-[var(--fg-3)]"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
