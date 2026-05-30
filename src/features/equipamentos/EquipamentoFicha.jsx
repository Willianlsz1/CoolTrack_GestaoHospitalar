import { Link, useParams } from '@tanstack/react-router'
import { useEquipamento } from './useEquipamento'

// Um campo da ficha: rótulo + valor (ou "—" quando vazio).
function Campo({ rotulo, valor }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500">
        {rotulo}
      </dt>
      <dd className="text-gray-100">{valor || '—'}</dd>
    </div>
  )
}

export default function EquipamentoFicha() {
  // strict:false lê os params sem precisar amarrar ao id exato da rota.
  const { id } = useParams({ strict: false })
  const { data: eq, isPending, isError, error } = useEquipamento(id)

  return (
    <div>
      <Link to="/" className="text-sm text-cyan-400 hover:underline">
        ← Voltar
      </Link>

      {isPending && <p className="mt-4 text-gray-400">Carregando…</p>}

      {isError && (
        <p className="mt-4 text-red-400">
          Erro ao carregar o equipamento: {error.message}
        </p>
      )}

      {!isPending && !isError && eq && (
        <article className="mt-4">
          {eq.foto_url && (
            <img
              src={eq.foto_url}
              alt={eq.nome}
              className="mb-4 h-48 w-full max-w-md rounded object-cover"
            />
          )}
          <h1 className="text-2xl font-bold text-cyan-400">{eq.nome}</h1>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Tipo" valor={eq.tipo} />
            <Campo rotulo="Status" valor={eq.status} />
            <Campo rotulo="Marca" valor={eq.marca} />
            <Campo rotulo="Modelo" valor={eq.modelo} />
            <Campo rotulo="Nº de série" valor={eq.serie} />
            <Campo rotulo="Patrimônio" valor={eq.patrimonio} />
            <Campo rotulo="Setor" valor={eq.setor} />
            <Campo rotulo="Andar" valor={eq.andar} />
            <Campo rotulo="Sala" valor={eq.sala} />
            <Campo rotulo="Instalação" valor={eq.data_instalacao} />
            <Campo rotulo="Garantia até" valor={eq.data_garantia} />
          </dl>
        </article>
      )}
    </div>
  )
}
