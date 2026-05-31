import { useState } from 'react'
import { Check, CircleAlert } from 'lucide-react'
import { useCriarManutencao } from '../manutencoes/useCriarManutencao'
import { useMeuPerfil } from '../perfil/useMeuPerfil'
import { hojeLocal } from '../../core/data'
import { FREQ_LABELS } from './rotulos'
import { Input } from '../../components/Input'
import { Textarea } from '../../components/Textarea'
import { Button } from '../../components/Button'

// Execução do checklist: itens "tudo OK" por padrão; o técnico só marca as
// exceções (com observação) + uma observação geral. Confirmar = assinar
// (registrado_por = usuário logado). Cria uma manutenção PREVENTIVA com o
// snapshot do checklist.
export default function ExecutarChecklist({
  equipamento,
  modelo,
  onSucesso,
  onCancelar,
}) {
  const { data: perfil } = useMeuPerfil()
  const [itens, setItens] = useState(
    modelo.itens.map((it) => ({ ...it, ok: true, obs: '' })),
  )
  const [observacao, setObservacao] = useState('')
  const criar = useCriarManutencao()

  function setOkItem(i, ok) {
    setItens((arr) => arr.map((it, idx) => (idx === i ? { ...it, ok } : it)))
  }
  function setObs(i, valor) {
    setItens((arr) =>
      arr.map((it, idx) => (idx === i ? { ...it, obs: valor } : it)),
    )
  }

  const excecoes = itens.filter((it) => !it.ok).length

  function handleSubmit(e) {
    e.preventDefault()
    const snapshot = {
      frequencia: modelo.frequencia,
      itens: itens.map((it) => ({
        procedimento: it.procedimento,
        servico: it.servico,
        ok: it.ok,
        ...(it.ok ? {} : { obs: it.obs.trim() }),
      })),
    }
    criar.mutate(
      {
        equipamento_id: equipamento.id,
        tipo: 'preventiva',
        data: hojeLocal(),
        descricao: observacao.trim() || null,
        checklist: snapshot,
      },
      { onSuccess: onSucesso },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="t-secondary -mt-1">
        {FREQ_LABELS[modelo.frequencia]} · cada item já vem como OK. Marque
        “Exceção” só onde houve problema.
      </p>

      <ul className="space-y-2">
        {itens.map((it, i) => (
          <li
            key={i}
            className="rounded-[var(--r)] border border-[var(--border)] p-3"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
              <div className="min-w-0">
                <div className="text-[14px] text-[var(--fg)]">
                  {it.procedimento}
                </div>
                {it.servico && <div className="t-caption">{it.servico}</div>}
              </div>
              <div className="inline-flex flex-none gap-0.5 rounded-[var(--r)] border border-[var(--border)] p-0.5 text-[13px]">
                <button
                  type="button"
                  onClick={() => setOkItem(i, true)}
                  aria-pressed={it.ok}
                  className={`flex items-center gap-1 rounded-[6px] px-3 py-1 ${
                    it.ok
                      ? 'bg-[var(--ok-fill)] text-[var(--ok)]'
                      : 'text-[var(--fg-3)] hover:text-[var(--fg)]'
                  }`}
                >
                  <Check size={14} /> OK
                </button>
                <button
                  type="button"
                  onClick={() => setOkItem(i, false)}
                  aria-pressed={!it.ok}
                  className={`flex items-center gap-1 rounded-[6px] px-3 py-1 ${
                    !it.ok
                      ? 'bg-[var(--warn-fill)] text-[var(--warn)]'
                      : 'text-[var(--fg-3)] hover:text-[var(--fg)]'
                  }`}
                >
                  <CircleAlert size={14} /> Exceção
                </button>
              </div>
            </div>
            {!it.ok && (
              <Input
                className="mt-2"
                placeholder="O que aconteceu? (ex.: vazamento de gás)"
                value={it.obs}
                onChange={(e) => setObs(i, e.target.value)}
              />
            )}
          </li>
        ))}
      </ul>

      <div>
        <span className="ct-label">Observação geral (opcional)</span>
        <Textarea
          rows={2}
          placeholder="Anotações da visita…"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />
      </div>

      {criar.isError && (
        <p className="text-[13px]" style={{ color: 'var(--danger)' }}>
          Erro ao salvar: {criar.error.message}
        </p>
      )}

      <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="t-caption">
          {excecoes === 0
            ? 'Tudo OK'
            : `${excecoes} ${excecoes === 1 ? 'exceção' : 'exceções'}`}{' '}
          · assinando como {perfil?.nome ?? 'você'}
        </span>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={criar.isPending}>
            {criar.isPending ? 'Salvando…' : 'Confirmar e assinar'}
          </Button>
        </div>
      </div>
    </form>
  )
}
