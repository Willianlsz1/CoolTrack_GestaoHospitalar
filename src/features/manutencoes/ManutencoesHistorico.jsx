import { useState } from 'react'
import { useManutencoes } from './useManutencoes'
import ManutencaoForm from './ManutencaoForm'
import Modal from '../../components/Modal'

// Cor do badge por tipo de manutenção.
function corDoTipo(tipo) {
  switch (tipo) {
    case 'preventiva':
      return 'bg-green-500/15 text-green-400'
    case 'corretiva':
      return 'bg-red-500/15 text-red-400'
    case 'preditiva':
      return 'bg-blue-500/15 text-blue-400'
    default:
      return 'bg-gray-500/15 text-gray-400'
  }
}

export default function ManutencoesHistorico({ equipamentoId }) {
  const {
    data: manutencoes,
    isPending,
    isError,
    error,
  } = useManutencoes(equipamentoId)
  const [formAberto, setFormAberto] = useState(false)

  return (
    <section className="mt-6 border-t border-gray-800 pt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm uppercase tracking-wide text-gray-500">
          Manutenções
        </h2>
        <button
          onClick={() => setFormAberto(true)}
          className="rounded bg-cyan-500 px-3 py-1 text-sm font-medium text-gray-950 hover:bg-cyan-400"
        >
          + Registrar
        </button>
      </div>

      {isPending && <p className="text-gray-400">Carregando…</p>}

      {isError && <p className="text-red-400">Erro: {error.message}</p>}

      {!isPending && !isError && manutencoes.length === 0 && (
        <p className="text-gray-400">Nenhuma manutenção registrada ainda.</p>
      )}

      {!isPending && !isError && manutencoes.length > 0 && (
        <ul className="space-y-3">
          {manutencoes.map((m) => (
            <li
              key={m.id}
              className="rounded-lg border border-gray-800 bg-gray-900 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-300">{m.data}</span>
                <span
                  className={`rounded px-2 py-0.5 text-xs ${corDoTipo(m.tipo)}`}
                >
                  {m.tipo}
                </span>
              </div>
              {m.tecnico && (
                <p className="mt-1 text-sm text-gray-400">
                  Técnico: {m.tecnico}
                </p>
              )}
              {m.descricao && (
                <p className="mt-2 text-sm text-gray-300">{m.descricao}</p>
              )}
              {m.pecas && (
                <p className="mt-2 text-sm text-gray-500">Peças: {m.pecas}</p>
              )}
              {m.proxima_manutencao && (
                <p className="mt-2 text-sm text-gray-500">
                  Próxima: {m.proxima_manutencao}
                </p>
              )}
              {(m.foto_antes_url || m.foto_depois_url) && (
                <div className="mt-3 flex gap-3">
                  {m.foto_antes_url && (
                    <figure>
                      <img
                        src={m.foto_antes_url}
                        alt="Antes"
                        className="h-24 w-24 rounded object-cover"
                      />
                      <figcaption className="mt-1 text-xs text-gray-500">
                        Antes
                      </figcaption>
                    </figure>
                  )}
                  {m.foto_depois_url && (
                    <figure>
                      <img
                        src={m.foto_depois_url}
                        alt="Depois"
                        className="h-24 w-24 rounded object-cover"
                      />
                      <figcaption className="mt-1 text-xs text-gray-500">
                        Depois
                      </figcaption>
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
