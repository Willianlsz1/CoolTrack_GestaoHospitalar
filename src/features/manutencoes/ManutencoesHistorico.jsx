import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useManutencoes } from './useManutencoes'
import ManutencaoForm from './ManutencaoForm'
import Modal from '../../components/Modal'
import { Button } from '../../components/Button'
import { TipoManutencaoBadge } from '../../components/TipoManutencaoBadge'
import { AprovacaoBadge } from '../../components/AprovacaoBadge'
import { formatarData } from '../../core/data'

// Lista parametrizável de manutenções de um equipamento. Reusada nas duas
// abas da ficha:
//  - Serviços:  tipos=['corretiva','preditiva'], com botão Registrar.
//  - Checklist: tipos=['preventiva'], sem registro (preventiva só via checklist).
export default function ManutencoesHistorico({
  equipamentoId,
  titulo = 'Manutenções',
  tipos,
  comRegistro = true,
  vazio = 'Nenhum registro ainda.',
}) {
  const {
    data: manutencoes,
    isPending,
    isError,
    error,
  } = useManutencoes(equipamentoId)
  const [formAberto, setFormAberto] = useState(false)

  // Filtra pelos tipos pedidos (sem `tipos` = todos).
  const lista = (manutencoes ?? []).filter(
    (m) => !tipos || tipos.includes(m.tipo),
  )

  return (
    <section className="mt-6 border-t border-[var(--border)] pt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[14px] text-[var(--fg-3)]">{titulo}</h2>
        {comRegistro && (
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => setFormAberto(true)}
          >
            Registrar
          </Button>
        )}
      </div>

      {isPending && <p className="t-secondary">Carregando…</p>}
      {isError && (
        <p style={{ color: 'var(--danger)' }}>Erro: {error.message}</p>
      )}
      {!isPending && !isError && lista.length === 0 && (
        <p className="t-secondary">{vazio}</p>
      )}

      {!isPending && !isError && lista.length > 0 && (
        <ul className="space-y-3">
          {lista.map((m) => (
            <li key={m.id} className="ct-card">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-[var(--fg)]">
                  {formatarData(m.data)}
                </span>
                <div className="flex items-center gap-1.5">
                  <AprovacaoBadge status={m.aprovacao_status} />
                  <TipoManutencaoBadge tipo={m.tipo} />
                </div>
              </div>
              {(m.perfis?.nome || m.tecnico) && (
                <p className="t-secondary mt-1">
                  Técnico: {m.perfis?.nome ?? m.tecnico}
                </p>
              )}
              {m.aprovacao_status === 'aprovado' && (
                <p className="t-caption mt-1" style={{ color: 'var(--ok)' }}>
                  Aprovado por {m.aprovador?.nome ?? '—'}
                  {m.aprovado_em && ` · ${formatarData(m.aprovado_em)}`}
                </p>
              )}
              {m.aprovacao_status === 'reprovado' && m.aprovacao_motivo && (
                <p
                  className="mt-1 text-[14px]"
                  style={{ color: 'var(--danger)' }}
                >
                  Reprovado: {m.aprovacao_motivo}
                </p>
              )}
              {m.descricao && (
                <p className="mt-2 text-sm text-[var(--fg-2)]">{m.descricao}</p>
              )}
              {m.pecas && <p className="t-caption mt-2">Peças: {m.pecas}</p>}
              {m.proxima_manutencao && (
                <p className="t-caption mt-2">
                  Próxima: {formatarData(m.proxima_manutencao)}
                </p>
              )}
              {(m.foto_antes_url || m.foto_depois_url) && (
                <div className="mt-3 flex gap-3">
                  {m.foto_antes_url && (
                    <figure>
                      <img
                        src={m.foto_antes_url}
                        alt="Antes"
                        className="h-24 w-24 rounded-[var(--r)] object-cover"
                      />
                      <figcaption className="t-caption mt-1">Antes</figcaption>
                    </figure>
                  )}
                  {m.foto_depois_url && (
                    <figure>
                      <img
                        src={m.foto_depois_url}
                        alt="Depois"
                        className="h-24 w-24 rounded-[var(--r)] object-cover"
                      />
                      <figcaption className="t-caption mt-1">Depois</figcaption>
                    </figure>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {formAberto && (
        <Modal titulo="Registrar serviço" onClose={() => setFormAberto(false)}>
          <ManutencaoForm
            equipamentoId={equipamentoId}
            tipos={tipos}
            onSucesso={() => setFormAberto(false)}
            onCancelar={() => setFormAberto(false)}
          />
        </Modal>
      )}
    </section>
  )
}
