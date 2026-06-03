import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Boxes,
  RefreshCw,
  AlertTriangle,
  Clock,
  ClipboardCheck,
  ArrowRight,
} from 'lucide-react'
import { useEquipamentos } from '../equipamentos/useEquipamentos'
import { useTodasManutencoes } from './useTodasManutencoes'
import { useEhAdmin } from '../perfil/useEhAdmin'
import { contagemPorAprovacao } from '../aprovacoes/aprovacoesSelectors'
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
  const { ehAdmin } = useEhAdmin()

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
  // Serviços aguardando aprovação (só relevante p/ o gestor/admin).
  const pendentesAprov = ehAdmin ? contagemPorAprovacao(mans).pendente : 0
  // Quando os dados foram buscados (o mais recente das duas queries).
  const atualizadoEm = Math.max(eqQuery.dataUpdatedAt, manQuery.dataUpdatedAt)
  const atualizar = () => {
    eqQuery.refetch()
    manQuery.refetch()
  }

  return (
    <Pagina
      total={eqs.length}
      atualizadoEm={atualizadoEm}
      onAtualizar={atualizar}
    >
      <div className="flex flex-col gap-3">
        {/* Ação do gestor: serviços aguardando aprovação (só admin, só se houver) */}
        {pendentesAprov > 0 && (
          <Link
            to="/aprovacoes"
            className="group flex items-center gap-3 rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-[15px]"
            style={{ textDecoration: 'none' }}
          >
            <ClipboardCheck
              size={18}
              className="flex-none"
              style={{ color: 'var(--warn)' }}
            />
            <span className="text-[var(--fg)]">
              <b className="font-medium">{pendentesAprov}</b>{' '}
              {pendentesAprov === 1
                ? 'serviço aguardando'
                : 'serviços aguardando'}{' '}
              aprovação
            </span>
            <span className="ml-auto inline-flex items-center gap-1 text-[var(--link)]">
              Revisar
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        )}

        {/* Nível 1 — alertas de ação */}
        <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
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

const chip =
  'inline-flex items-center gap-[7px] rounded-full border border-[var(--border)] bg-[var(--surface)] px-[14px] py-1.5 text-[14px] text-[var(--fg-2)]'

// Chip "Atualizado há X min" (de dataUpdatedAt); clicar re-busca os dados.
// O tempo é calculado no efeito/intervalo (não no render — Date.now é impuro)
// e guardado em estado; recalcula a cada 60s e quando os dados mudam.
function ChipAtualizado({ atualizadoEm, onAtualizar }) {
  const [min, setMin] = useState(0)
  useEffect(() => {
    const calcular = () =>
      setMin(Math.floor((Date.now() - atualizadoEm) / 60000))
    calcular()
    const id = setInterval(calcular, 60000)
    return () => clearInterval(id)
  }, [atualizadoEm])
  const quando = min < 1 ? 'agora' : `há ${min} min`
  return (
    <button
      type="button"
      onClick={onAtualizar}
      title="Clique para atualizar"
      className={`${chip} hover:text-[var(--fg)]`}
    >
      <RefreshCw size={14} className="text-[var(--fg-3)]" /> Atualizado {quando}
    </button>
  )
}

// Casca: título + chips (total real + "atualizado há X min").
function Pagina({ total, atualizadoEm, onAtualizar, children }) {
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
            <ChipAtualizado
              atualizadoEm={atualizadoEm}
              onAtualizar={onAtualizar}
            />
          </div>
        )}
      </div>
      {children}
    </div>
  )
}
