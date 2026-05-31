import { useState } from 'react'
import { Link, useParams, useSearch, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Printer, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useEquipamento } from './useEquipamento'
import { TIPO_LABELS } from './rotulos'
import { formatarData } from '../../core/data'
import { nomeSetorDoEquipamento } from '../../core/dominio'
import { IconeTipo } from './iconesTipo'
import { StatusBadge } from '../../components/StatusBadge'
import { Button } from '../../components/Button'
import Modal from '../../components/Modal'
import SugestaoManutencao from '../ia/SugestaoManutencao'
import ManutencoesHistorico from '../manutencoes/ManutencoesHistorico'
import ChecklistEquipamento from '../checklists/ChecklistEquipamento'

// Botão de aba (Registros / Checklist).
function AbaBtn({ ativo, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-3 py-2 text-[15px] ${
        ativo
          ? 'border-[var(--link)] text-[var(--fg)]'
          : 'border-transparent text-[var(--fg-3)] hover:text-[var(--fg)]'
      }`}
    >
      {children}
    </button>
  )
}

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
      <dd className="m-0 text-[15px] text-[var(--fg)]">{valor || '—'}</dd>
    </div>
  )
}

export default function EquipamentoFicha() {
  // strict:false lê os params sem precisar amarrar ao id exato da rota.
  const { id } = useParams({ strict: false })
  const { aba: abaUrl } = useSearch({ strict: false })
  const navigate = useNavigate()
  const { data: eq, isPending, isError, error } = useEquipamento(id)
  const [qrAberto, setQrAberto] = useState(false)

  // A aba é DIRIGIDA pela URL (fonte única): trocar de aba atualiza ?aba, e
  // navegar entre equipamentos via deep-link já abre na aba certa.
  const aba = abaUrl === 'checklist' ? 'checklist' : 'registros'
  const irParaAba = (nova) =>
    navigate({
      to: '/equipamentos/$id',
      params: { id },
      search: nova === 'checklist' ? { aba: 'checklist' } : {},
      replace: true,
    })

  return (
    <div>
      <Link
        to="/"
        className="ct-link inline-flex items-center gap-1 text-[14px]"
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
          {/* Cabeçalho compacto: identidade + specs */}
          <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {eq.foto_url ? (
                <img
                  src={eq.foto_url}
                  alt={eq.nome}
                  className="h-16 w-16 flex-none rounded-[var(--r)] object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 flex-none items-center justify-center rounded-[var(--r)] bg-[var(--surface-2)] text-[var(--fg-3)]">
                  <IconeTipo tipo={eq.tipo} size={28} strokeWidth={1} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1>{eq.nome}</h1>
                  <StatusBadge status={eq.status} />
                </div>
                <div className="t-caption mt-1">
                  {[
                    nomeSetorDoEquipamento(eq),
                    eq.patrimonio && `Patrimônio ${eq.patrimonio}`,
                    TIPO_LABELS[eq.tipo] ?? eq.tipo,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={QrCode}
                onClick={() => setQrAberto(true)}
              >
                QR / Etiqueta
              </Button>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-[var(--border)] pt-4 sm:grid-cols-3 lg:grid-cols-4">
              <Campo rotulo="Tipo" valor={TIPO_LABELS[eq.tipo] ?? eq.tipo} />
              <Campo rotulo="Setor" valor={nomeSetorDoEquipamento(eq)} />
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
          </div>

          {/* Abas em toda a largura */}
          <div className="mt-6 flex gap-1 border-b border-[var(--border)]">
            <AbaBtn
              ativo={aba === 'registros'}
              onClick={() => irParaAba('registros')}
            >
              Registros
            </AbaBtn>
            <AbaBtn
              ativo={aba === 'checklist'}
              onClick={() => irParaAba('checklist')}
            >
              Checklist
            </AbaBtn>
          </div>

          <div className="pt-4">
            {aba === 'registros' ? (
              <>
                <SugestaoManutencao equipamentoId={eq.id} />
                <ManutencoesHistorico equipamentoId={eq.id} />
              </>
            ) : (
              <ChecklistEquipamento equipamento={eq} />
            )}
          </div>

          {qrAberto && (
            <Modal titulo="QR Code" onClose={() => setQrAberto(false)}>
              <div className="flex flex-col items-center gap-3">
                {/* .etiqueta: o que vai impresso (fundo branco, texto escuro). */}
                <div className="etiqueta inline-block rounded-[var(--r)] bg-white p-4 text-center text-gray-900">
                  <QRCodeSVG value={urlDaFicha(eq.id)} size={160} level="M" />
                  <p className="mt-2 font-medium">{eq.nome}</p>
                  {nomeSetorDoEquipamento(eq) && (
                    <p className="text-sm">{nomeSetorDoEquipamento(eq)}</p>
                  )}
                  {eq.patrimonio && (
                    <p className="text-sm">Patrimônio: {eq.patrimonio}</p>
                  )}
                </div>
                <p className="mono t-caption break-all text-center">
                  {urlDaFicha(eq.id)}
                </p>
                <Button
                  variant="secondary"
                  icon={Printer}
                  onClick={() => window.print()}
                >
                  Imprimir etiqueta
                </Button>
              </div>
            </Modal>
          )}
        </article>
      )}
    </div>
  )
}
