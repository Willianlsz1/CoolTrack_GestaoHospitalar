import { Boxes, RefreshCw, AlertTriangle, Clock } from 'lucide-react'
import { useEquipamentos } from '../equipamentos/useEquipamentos'
import { useTodasManutencoes } from './useTodasManutencoes'
import {
  contarPorStatus,
  atrasadosComDias,
  venceEmBreve,
  ultimasManutencoes,
  porSetorOrdenado,
} from './dashboardAgregacoes'
import { ultimaPreventivaPorEquipamento } from '../../core/dominio'
import { AlertCard } from './AlertCard'
import { PanoramaStatus } from './PanoramaStatus'
import { UltimasManutencoes } from './UltimasManutencoes'
import { PorSetor } from './PorSetor'

export default function DashboardPage() {
  const eqQuery = useEquipamentos()
  const manQuery = useTodasManutencoes()

  const carregando = eqQuery.isPending || manQuery.isPending
  const erro = eqQuery.isError || manQuery.isError

  if (carregando) {
    return (
      <Pagina>
        <p className="t-secondary">Carregando…</p>
      </Pagina>
    )
  }
  if (erro) {
    return (
      <Pagina>
        <p style={{ color: 'var(--danger)' }}>Erro ao carregar os dados.</p>
      </Pagina>
    )
  }

  const eqs = eqQuery.data
  const mans = manQuery.data
  const contagem = contarPorStatus(eqs)
  // Calcula a última preventiva uma vez e reusa nos dois alertas.
  const ultimaPrev = ultimaPreventivaPorEquipamento(mans)
  const atrasados = atrasadosComDias(eqs, ultimaPrev)
  const aVencer = venceEmBreve(eqs, ultimaPrev)

  return (
    <Pagina total={eqs.length}>
      <div className="flex flex-col gap-3">
        {/* Nível 1 — alertas de ação */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AlertCard
            variant="danger"
            icon={AlertTriangle}
            titulo="Manutenção atrasada"
            hint="Passou do intervalo desde a última preventiva — ação imediata"
            total={atrasados.length}
            itens={atrasados.slice(0, 5)}
          />
          <AlertCard
            variant="warn"
            icon={Clock}
            titulo="Vence em breve"
            hint="Higienização a vencer nos próximos 7 dias — agendar"
            total={aVencer.length}
            itens={aVencer.slice(0, 5)}
          />
        </section>

        {/* Nível 2 — panorama */}
        <PanoramaStatus contagem={contagem} total={eqs.length} />

        {/* Nível 3 — contexto */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.55fr_1fr]">
          <UltimasManutencoes manutencoes={ultimasManutencoes(mans)} />
          <PorSetor setores={porSetorOrdenado(eqs)} />
        </section>
      </div>
    </Pagina>
  )
}

// Casca: título + chips (total real; "atualizado" provisório).
function Pagina({ total, children }) {
  const chip =
    'inline-flex items-center gap-[7px] rounded-full border border-[var(--border)] bg-[var(--surface)] px-[14px] py-1.5 text-[13px] text-[var(--fg-2)]'
  return (
    <div>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1>Dashboard</h1>
          <p className="t-secondary mt-1">Visão geral dos equipamentos</p>
        </div>
        {total !== undefined && (
          <div className="flex flex-wrap items-center gap-[10px]">
            <span className={chip}>
              <Boxes size={14} className="text-[var(--fg-3)]" />
              <b className="font-medium text-[var(--fg)]">{total}</b>{' '}
              equipamentos
            </span>
            {/* TODO: calcular "Atualizado há X min" de verdade (dataUpdatedAt). */}
            <span className={chip}>
              <RefreshCw size={14} className="text-[var(--fg-3)]" /> Atualizado
              agora
            </span>
          </div>
        )}
      </div>
      {children}
    </div>
  )
}
