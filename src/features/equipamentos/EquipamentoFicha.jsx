import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, Printer } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useEquipamento } from './useEquipamento'
import { TIPO_LABELS } from './rotulos'
import { formatarData } from '../../core/data'
import { IconeTipo } from './iconesTipo'
import { StatusBadge } from '../../components/StatusBadge'
import { Button } from '../../components/Button'
import SugestaoManutencao from '../ia/SugestaoManutencao'
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
      <dt className="t-caption mb-0.5">{rotulo}</dt>
      <dd className="m-0 text-[14px] text-[var(--fg)]">{valor || '—'}</dd>
    </div>
  )
}

export default function EquipamentoFicha() {
  // strict:false lê os params sem precisar amarrar ao id exato da rota.
  const { id } = useParams({ strict: false })
  const { data: eq, isPending, isError, error } = useEquipamento(id)

  return (
    <div>
      <Link
        to="/"
        className="ct-link inline-flex items-center gap-1 text-[13px]"
      >
        <ArrowLeft size={14} /> Voltar
      </Link>

      {isPending && <p className="t-secondary mt-4">Carregando…</p>}

      {isError && (
        <p className="mt-4" style={{ color: 'var(--danger)' }}>
          Erro ao carregar o equipamento: {error.message}
        </p>
      )}

      {!isPending && !isError && !eq && (
        <p className="t-secondary mt-4">Equipamento não encontrado.</p>
      )}

      {!isPending && !isError && eq && (
        <article className="mt-4">
          {eq.foto_url ? (
            <img
              src={eq.foto_url}
              alt={eq.nome}
              className="mb-4 h-48 w-full max-w-[420px] rounded-[var(--r)] object-cover"
            />
          ) : (
            <div className="mb-4 flex h-48 w-full max-w-[420px] items-center justify-center rounded-[var(--r)] bg-[var(--surface-2)] text-[var(--fg-3)]">
              <IconeTipo tipo={eq.tipo} size={48} strokeWidth={1} />
            </div>
          )}

          <div className="flex items-center gap-3">
            <h1>{eq.nome}</h1>
            <StatusBadge status={eq.status} />
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Tipo" valor={TIPO_LABELS[eq.tipo] ?? eq.tipo} />
            <Campo rotulo="Setor" valor={eq.setores?.nome ?? eq.setor} />
            <Campo rotulo="Marca" valor={eq.marca} />
            <Campo rotulo="Modelo" valor={eq.modelo} />
            <Campo rotulo="Nº de série" valor={eq.serie} />
            <Campo rotulo="Patrimônio" valor={eq.patrimonio} />
            <Campo rotulo="Andar" valor={eq.andar} />
            <Campo rotulo="Sala" valor={eq.sala} />
            <Campo
              rotulo="Instalação"
              valor={formatarData(eq.data_instalacao)}
            />
            <Campo
              rotulo="Garantia até"
              valor={formatarData(eq.data_garantia)}
            />
          </dl>

          <section className="mt-6 border-t border-[var(--border)] pt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[13px] text-[var(--fg-3)]">QR Code</h2>
              <Button
                size="sm"
                variant="secondary"
                icon={Printer}
                onClick={() => window.print()}
              >
                Imprimir etiqueta
              </Button>
            </div>

            {/* .etiqueta: o que vai impresso. Fundo branco + texto escuro
                servem na tela e no papel (e o QR precisa de contraste). */}
            <div className="etiqueta inline-block rounded-[var(--r)] bg-white p-4 text-center text-gray-900">
              <QRCodeSVG value={urlDaFicha(eq.id)} size={160} level="M" />
              <p className="mt-2 font-medium">{eq.nome}</p>
              {eq.setor && <p className="text-sm">{eq.setor}</p>}
              {eq.patrimonio && (
                <p className="text-sm">Patrimônio: {eq.patrimonio}</p>
              )}
            </div>

            <p className="mono t-caption mt-2 break-all">{urlDaFicha(eq.id)}</p>
          </section>

          <SugestaoManutencao equipamentoId={eq.id} />
          <ManutencoesHistorico equipamentoId={eq.id} />
        </article>
      )}
    </div>
  )
}
