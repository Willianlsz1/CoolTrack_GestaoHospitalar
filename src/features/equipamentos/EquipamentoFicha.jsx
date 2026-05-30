import { Link, useParams } from '@tanstack/react-router'
import { QRCodeSVG } from 'qrcode.react'
import { useEquipamento } from './useEquipamento'
import ManutencoesHistorico from '../manutencoes/ManutencoesHistorico'

// URL absoluta da ficha — é o que o QR Code codifica. Em produção,
// VITE_APP_BASE_URL aponta pro domínio publicado (para o QR funcionar
// no celular); sem ela, cai na origem atual.
function urlDaFicha(id) {
  const base = import.meta.env.VITE_APP_BASE_URL || window.location.origin
  return `${base}/equipamentos/${id}`
}

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

      {!isPending && !isError && !eq && (
        <p className="mt-4 text-gray-400">Equipamento não encontrado.</p>
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

          <div className="mt-6 border-t border-gray-800 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm uppercase tracking-wide text-gray-500">
                QR Code
              </h2>
              <button
                onClick={() => window.print()}
                className="rounded bg-cyan-500 px-3 py-1 text-sm font-medium text-gray-950 hover:bg-cyan-400"
              >
                Imprimir etiqueta
              </button>
            </div>

            {/* .etiqueta: o que vai impresso. Fundo branco + texto escuro
                servem na tela e no papel (e o QR precisa de contraste). */}
            <div className="etiqueta inline-block rounded bg-white p-4 text-center text-gray-900">
              <QRCodeSVG value={urlDaFicha(eq.id)} size={160} level="M" />
              <p className="mt-2 font-semibold">{eq.nome}</p>
              {eq.setor && <p className="text-sm">{eq.setor}</p>}
              {eq.patrimonio && (
                <p className="text-sm">Patrimônio: {eq.patrimonio}</p>
              )}
            </div>

            <p className="mt-2 break-all text-xs text-gray-500">
              {urlDaFicha(eq.id)}
            </p>
          </div>

          <ManutencoesHistorico equipamentoId={eq.id} />
        </article>
      )}
    </div>
  )
}
