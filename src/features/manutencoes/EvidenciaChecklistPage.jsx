import { useParams, Link } from '@tanstack/react-router'
import { ArrowLeft, Printer } from 'lucide-react'
import { useManutencao } from './useManutencao'
import { useConfigPmoc } from '../config/useConfigPmoc'
import { TIPO_LABELS } from '../equipamentos/rotulos'
import { MANUTENCAO_TIPO_LABELS } from './rotulos'
import { FREQ_LABELS } from '../checklists/rotulos'
import { formatarData, formatarDataLocal } from '../../core/data'
import { nomeSetorDoEquipamento } from '../../core/dominio'
import { Button } from '../../components/Button'
import { Carregando, Erro } from '../../components/Estado'

// Imprime só o documento (a classe no body alterna o modo no @media print —
// mesma infra do relatório).
function imprimir() {
  document.body.classList.add('imprimir-relatorio')
  const limpar = () => {
    document.body.classList.remove('imprimir-relatorio')
    window.removeEventListener('afterprint', limpar)
  }
  window.addEventListener('afterprint', limpar)
  window.print()
}

const th = 'border-b border-[var(--border)] px-3 py-2 text-left font-medium'
const td = 'border-b border-[var(--border)] px-3 py-2 align-top'

function Campo({ rotulo, valor }) {
  return (
    <div>
      <div className="t-caption">{rotulo}</div>
      <div className="text-[14px] text-[var(--fg)]">{valor || '—'}</div>
    </div>
  )
}

function Assinatura({ linhaNome, papel, detalhe }) {
  return (
    <div>
      <div className="assinatura-linha mb-1 h-px w-full bg-[var(--fg-3)]" />
      {/* sem nome (assinatura física) → linha em branco mantendo a altura */}
      <div className="text-[var(--fg)]">{linhaNome || ' '}</div>
      <div className="t-caption">{papel}</div>
      {detalhe && <div className="t-caption">{detalhe}</div>}
    </div>
  )
}

// Documento de evidência (Ordem de Serviço) de UMA execução de checklist.
export default function EvidenciaChecklistPage() {
  const { id } = useParams({ strict: false })
  const { data: m, isPending, isError } = useManutencao(id)
  const { data: config } = useConfigPmoc()

  if (isPending) return <Carregando />
  if (isError) return <Erro>Erro ao carregar a evidência.</Erro>
  if (!m) return <p className="t-secondary">Evidência não encontrada.</p>
  if (!m.checklist) {
    return (
      <p className="t-secondary">
        Este registro não tem checklist (não é uma execução preventiva).
      </p>
    )
  }

  const eq = m.equipamentos
  const itens = m.checklist.itens ?? []
  const setorNome = nomeSetorDoEquipamento(eq)
  const localizacao = [setorNome, eq?.andar, eq?.sala]
    .filter(Boolean)
    .join(' · ')
  const aprovado = m.aprovacao_status === 'aprovado'

  return (
    <div>
      {/* Barra de ações — some na impressão (está fora do .relatorio-impressao) */}
      <div className="no-print mb-4 flex items-center justify-between gap-3">
        <Link
          to="/equipamentos/$id"
          params={{ id: m.equipamento_id }}
          search={{ aba: 'checklist' }}
          className="ct-link inline-flex items-center gap-1 text-[14px]"
        >
          <ArrowLeft size={16} /> Voltar
        </Link>
        <Button variant="secondary" icon={Printer} onClick={imprimir}>
          Imprimir / PDF
        </Button>
      </div>

      {/* Documento */}
      <div className="relatorio-impressao">
        {config?.hospital_nome && (
          <div className="mb-3 border-b border-[var(--border)] pb-3">
            <div className="text-[17px] font-medium text-[var(--fg)]">
              {config.hospital_nome}
            </div>
            <div className="t-caption">
              {[
                config.hospital_cnpj && `CNPJ ${config.hospital_cnpj}`,
                config.hospital_endereco,
              ]
                .filter(Boolean)
                .join(' · ')}
            </div>
          </div>
        )}

        <header className="mb-4">
          <h1>Ordem de Serviço — Checklist PMOC</h1>
          <p className="t-secondary mt-1">
            Evidência de manutenção {MANUTENCAO_TIPO_LABELS[m.tipo] ?? m.tipo}
            {m.checklist.frequencia &&
              ` · ${FREQ_LABELS[m.checklist.frequencia] ?? m.checklist.frequencia}`}{' '}
            · {formatarData(m.data)}
          </p>
        </header>

        <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          <Campo rotulo="Equipamento" valor={eq?.nome} />
          <Campo rotulo="Patrimônio" valor={eq?.patrimonio} />
          <Campo rotulo="Tipo" valor={TIPO_LABELS[eq?.tipo] ?? eq?.tipo} />
          <Campo rotulo="Localização" valor={localizacao} />
        </div>

        <table className="w-full text-[14px]">
          <thead>
            <tr className="text-[var(--fg-3)]">
              <th scope="col" className={th}>
                Procedimento
              </th>
              <th scope="col" className={th}>
                Serviço
              </th>
              <th scope="col" className={th}>
                Realizado
              </th>
              <th scope="col" className={th}>
                Observação
              </th>
            </tr>
          </thead>
          <tbody>
            {itens.map((it, i) => (
              <tr key={i} className="text-[var(--fg-2)]">
                <td className={`${td} text-[var(--fg)]`}>{it.procedimento}</td>
                <td className={td}>{it.servico ?? '—'}</td>
                <td className={td}>{it.ok ? 'SIM' : 'NÃO'}</td>
                <td className={td}>{it.obs ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {m.descricao && (
          <div className="mt-4">
            <div className="t-caption">Descrição do serviço executado</div>
            <div className="text-[14px] text-[var(--fg)]">{m.descricao}</div>
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-8 text-[14px] sm:grid-cols-3">
          {/* Esquerda — responsável do setor recebe o serviço (assina no papel) */}
          <Assinatura
            papel={`Responsável do setor${setorNome ? ` — ${setorNome}` : ''}`}
            detalhe="Recebi o serviço em condições de uso"
          />
          {/* Meio — responsável técnico que executou o serviço */}
          <Assinatura
            linhaNome={m.perfis?.nome ?? m.tecnico}
            papel={`Responsável técnico · ${formatarData(m.data)}`}
            detalhe="Execução do serviço (atestação eletrônica)"
          />
          {/* Direita — gestor (aprovação) */}
          <Assinatura
            linhaNome={aprovado ? m.aprovador?.nome : null}
            papel={
              aprovado && m.aprovado_em
                ? `Gestor · ${formatarDataLocal(m.aprovado_em)}`
                : 'Gestor'
            }
            detalhe={aprovado ? 'Aprovado' : 'Aguardando aprovação'}
          />
        </div>
      </div>
    </div>
  )
}
