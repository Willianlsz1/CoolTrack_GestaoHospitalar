import { useState } from 'react'
import { History } from 'lucide-react'
import { useAprovacoesLog } from './useAprovacoesLog'
import { rotuloDecisao } from './rotuloDecisao'
import { formatarDataLocal } from '../../core/data'

// Seção recolhível com a trilha de decisões de um serviço (aprovacoes_log).
// Carrega sob demanda (só ao abrir). Cada linha: data · quem · ação (+ motivo
// na reprovação). Mostra a sequência completa — útil quando um item foi
// aprovado, reaberto e reprovado, que de outra forma seria indistinguível.
export function HistoricoDecisoes({ manutencaoId }) {
  const [aberto, setAberto] = useState(false)
  const {
    data: log = [],
    isPending,
    isError,
  } = useAprovacoesLog(manutencaoId, aberto)

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="inline-flex items-center gap-1.5 text-[14px] text-[var(--link)]"
      >
        <History size={14} />
        {aberto ? 'Ocultar histórico de decisões' : 'Histórico de decisões'}
      </button>

      {aberto && (
        <div className="mt-2">
          {isPending && <p className="t-caption">Carregando…</p>}
          {isError && (
            <p className="t-caption" style={{ color: 'var(--danger)' }}>
              Erro ao carregar o histórico.
            </p>
          )}
          {!isPending && !isError && log.length === 0 && (
            <p className="t-caption">Nenhuma decisão registrada ainda.</p>
          )}
          {log.length > 0 && (
            <ul className="m-0 list-none space-y-1 p-0">
              {log.map((l) => (
                <li key={l.id} className="t-caption">
                  {formatarDataLocal(l.decidido_em)} ·{' '}
                  {l.decididor?.nome ?? '—'} · {rotuloDecisao(l.status)}
                  {l.status === 'reprovado' && l.motivo && ` — ${l.motivo}`}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
