import { useState } from 'react'
import { useEquipamentos } from './useEquipamentos'
import EquipamentosForm from './EquipamentosForm'

// Classes Tailwind do badge conforme o status. Função pequena inline;
// vira componente próprio só se for reusada em outra tela.
function corDoStatus(status) {
  switch (status) {
    case 'ativo':
      return 'bg-green-500/15 text-green-400'
    case 'manutencao':
      return 'bg-yellow-500/15 text-yellow-400'
    case 'inativo':
      return 'bg-gray-500/15 text-gray-400'
    default:
      return 'bg-gray-500/15 text-gray-400'
  }
}

export default function EquipamentosLista() {
  const { data: equipamentos, isPending, isError, error } = useEquipamentos()
  const [formAberto, setFormAberto] = useState(false)

  // O cabeçalho aparece sempre; só o conteúdo abaixo muda por estado.
  return (
    <div>
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">Equipamentos</h1>
          <p className="text-sm text-gray-500">
            Inventário de equipamentos de refrigeração
          </p>
        </div>
        <button
          onClick={() => setFormAberto(true)}
          className="shrink-0 rounded bg-cyan-500 px-4 py-2 text-sm font-medium text-gray-950 hover:bg-cyan-400"
        >
          + Novo equipamento
        </button>
      </header>

      {isPending && <p className="text-gray-400">Carregando equipamentos…</p>}

      {isError && (
        <div className="text-red-400">
          <p>Erro ao carregar equipamentos.</p>
          <p className="text-sm text-red-300/70">{error.message}</p>
        </div>
      )}

      {!isPending && !isError && equipamentos.length === 0 && (
        <p className="text-gray-400">Nenhum equipamento cadastrado ainda.</p>
      )}

      {!isPending && !isError && equipamentos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {equipamentos.map((eq) => (
            <article
              key={eq.id}
              className="rounded-lg border border-gray-800 bg-gray-900 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-gray-100">{eq.nome}</h2>
                <span
                  className={`shrink-0 rounded px-2 py-0.5 text-xs ${corDoStatus(eq.status)}`}
                >
                  {eq.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-400">{eq.tipo}</p>
              {eq.setor && (
                <p className="mt-2 text-sm text-gray-500">{eq.setor}</p>
              )}
            </article>
          ))}
        </div>
      )}

      {formAberto && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setFormAberto(false)}
        >
          {/* stopPropagation: clicar DENTRO do cartão não fecha o modal */}
          <div
            className="w-full max-w-md rounded-lg border border-gray-800 bg-gray-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-semibold text-gray-100">
              Novo equipamento
            </h2>
            <EquipamentosForm
              onSucesso={() => setFormAberto(false)}
              onCancelar={() => setFormAberto(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
