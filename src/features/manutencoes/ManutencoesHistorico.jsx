import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useManutencoes } from './useManutencoes'
import ManutencaoForm from './ManutencaoForm'
import Modal from '../../components/Modal'
import { Button } from '../../components/Button'
import { TipoManutencaoBadge } from '../../components/TipoManutencaoBadge'
import { formatarData } from '../../core/data'

export default function ManutencoesHistorico({ equipamentoId }) {
  const {
    data: manutencoes,
    isPending,
    isError,
    error,
  } = useManutencoes(equipamentoId)
  const [formAberto, setFormAberto] = useState(false)

  return (
    <section className="mt-6 border-t border-[var(--border)] pt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[14px] text-[var(--fg-3)]">Manutenções</h2>
        <Button
          size="sm"
          variant="primary"
          icon={Plus}
          onClick={() => setFormAberto(true)}
        >
          Registrar
        </Button>
      </div>

      {isPending && <p className="t-secondary">Carregando…</p>}

      {isError && (
        <p style={{ color: 'var(--danger)' }}>Erro: {error.message}</p>
      )}

      {!isPending && !isError && manutencoes.length === 0 && (
        <p className="t-secondary">Nenhuma manutenção registrada ainda.</p>
      )}

      {!isPending && !isError && manutencoes.length > 0 && (
        <ul className="space-y-3">
          {manutencoes.map((m) => (
            <li key={m.id} className="ct-card">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-[var(--fg)]">
                  {formatarData(m.data)}
                </span>
                <TipoManutencaoBadge tipo={m.tipo} />
              </div>
              {(m.perfis?.nome || m.tecnico) && (
                <p className="t-secondary mt-1">
                  Técnico: {m.perfis?.nome ?? m.tecnico}
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
        <Modal
          titulo="Registrar manutenção"
          onClose={() => setFormAberto(false)}
        >
          <ManutencaoForm
            equipamentoId={equipamentoId}
            onSucesso={() => setFormAberto(false)}
            onCancelar={() => setFormAberto(false)}
          />
        </Modal>
      )}
    </section>
  )
}
