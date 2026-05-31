import { useState } from 'react'
import { ClipboardCheck, ClipboardX, Plus } from 'lucide-react'
import { useModelosChecklist } from './useModelosChecklist'
import { useManutencoes } from '../manutencoes/useManutencoes'
import { hojeLocal, diasEntre, formatarData } from '../../core/data'
import { TIPO_LABELS } from '../equipamentos/rotulos'
import { Button } from '../../components/Button'
import Modal from '../../components/Modal'
import ExecutarChecklist from './ExecutarChecklist'

// Status do checklist mensal vs a cadência do equipamento.
function calcularStatus(ultima, intervalo) {
  if (!ultima) {
    return {
      cor: 'var(--warn)',
      titulo: 'Nunca executado',
      detalhe: 'Sem preventiva registrada.',
    }
  }
  const dataFmt = formatarData(ultima.data)
  if (!intervalo) {
    return {
      cor: 'var(--ok)',
      titulo: `Última: ${dataFmt}`,
      detalhe: 'Sem cadência (equipamento sem setor).',
    }
  }
  const restam = intervalo - diasEntre(ultima.data, hojeLocal())
  if (restam < 0) {
    return {
      cor: 'var(--danger)',
      titulo: `Atrasado há ${-restam} ${-restam === 1 ? 'dia' : 'dias'}`,
      detalhe: `Última: ${dataFmt}`,
    }
  }
  return {
    cor: 'var(--ok)',
    titulo: 'Em dia',
    detalhe: `Última: ${dataFmt} · vence em ${restam} ${restam === 1 ? 'dia' : 'dias'}`,
  }
}

// Resumo da última execução com checklist (data, quem, exceções).
function ResumoExecucao({ manutencao }) {
  const itens = manutencao.checklist?.itens ?? []
  const excecoes = itens.filter((it) => !it.ok)
  return (
    <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="t-caption mb-2">
        Última execução · {formatarData(manutencao.data)}
        {manutencao.perfis?.nome ? ` · ${manutencao.perfis.nome}` : ''}
      </p>
      {excecoes.length === 0 ? (
        <p className="t-secondary">Todos os {itens.length} itens OK.</p>
      ) : (
        <ul className="space-y-1">
          {excecoes.map((it, i) => (
            <li
              key={i}
              className="text-[13px]"
              style={{ color: 'var(--warn)' }}
            >
              ⚠ {it.procedimento}
              {it.obs ? ` — ${it.obs}` : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Aba "Checklist" da ficha: status mensal + execução. Decisão 0006.
export default function ChecklistEquipamento({ equipamento }) {
  const { data: modelos, isPending: mp } = useModelosChecklist()
  const { data: manutencoes, isPending: hp } = useManutencoes(equipamento.id)
  const [aberto, setAberto] = useState(false)

  if (mp || hp) return <p className="t-secondary">Carregando…</p>

  const modelo = (modelos ?? []).find(
    (m) => m.tipo === equipamento.tipo && m.frequencia === 'mensal',
  )

  if (!modelo) {
    return (
      <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)] p-5 text-center">
        <ClipboardX size={22} className="mx-auto mb-2 text-[var(--fg-3)]" />
        <p className="t-secondary">
          Nenhum modelo de checklist mensal para{' '}
          {TIPO_LABELS[equipamento.tipo] ?? equipamento.tipo}. Peça ao admin
          para cadastrar em “Checklists”.
        </p>
      </div>
    )
  }

  const ultima = (manutencoes ?? []).find((m) => m.tipo === 'preventiva')
  const status = calcularStatus(ultima, equipamento.intervalo_mensal)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <ClipboardCheck size={20} style={{ color: status.cor }} />
          <div>
            <div className="text-[14px] text-[var(--fg)]">{status.titulo}</div>
            <div className="t-caption">{status.detalhe}</div>
          </div>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setAberto(true)}>
          Executar checklist mensal
        </Button>
      </div>

      {ultima?.checklist && <ResumoExecucao manutencao={ultima} />}

      {aberto && (
        <Modal titulo="Checklist mensal" onClose={() => setAberto(false)}>
          <ExecutarChecklist
            equipamento={equipamento}
            modelo={modelo}
            onSucesso={() => setAberto(false)}
            onCancelar={() => setAberto(false)}
          />
        </Modal>
      )}
    </div>
  )
}
