import { useState } from 'react'
import { useCriarModelo, useAtualizarModelo } from './useModelosChecklist'
import { TIPOS, TIPO_LABELS } from '../equipamentos/rotulos'
import { FREQUENCIAS, FREQ_LABELS } from './rotulos'
import { Field } from '../../components/Field'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { EditorItens } from './EditorItens'

// Mensagem amigável quando o tipo+frequência já existe (unique 0019).
function mensagemErro(err) {
  if (err?.code === '23505' || /duplicate|unique/i.test(err?.message ?? '')) {
    return 'Já existe um modelo para esse tipo e frequência.'
  }
  return `Erro: ${err?.message ?? 'falha ao salvar.'}`
}

export default function ModeloChecklistForm({ modelo, onSucesso, onCancelar }) {
  const editando = Boolean(modelo)
  const [tipo, setTipo] = useState(modelo?.tipo ?? '')
  const [frequencia, setFrequencia] = useState(modelo?.frequencia ?? 'mensal')
  // _id estável só para a key do React (reordenação); removido ao salvar.
  const [itens, setItens] = useState(() =>
    (modelo?.itens ?? []).map((it) => ({ ...it, _id: crypto.randomUUID() })),
  )
  const [erro, setErro] = useState('')

  const criar = useCriarModelo()
  const atualizar = useAtualizarModelo()
  const mutation = editando ? atualizar : criar

  function handleSubmit(e) {
    e.preventDefault()
    if (tipo === '') {
      setErro('Selecione o tipo de equipamento.')
      return
    }
    const limpos = itens
      .map((it) => ({
        procedimento: it.procedimento.trim(),
        servico: it.servico.trim(),
      }))
      .filter((it) => it.procedimento !== '')
    if (limpos.length === 0) {
      setErro('Adicione ao menos um item ao checklist.')
      return
    }
    setErro('')

    if (editando) {
      atualizar.mutate(
        { id: modelo.id, itens: limpos },
        { onSuccess: onSucesso },
      )
    } else {
      criar.mutate(
        { tipo, frequencia, itens: limpos },
        { onSuccess: onSucesso },
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Tipo de equipamento" required>
          <Select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            disabled={editando}
          >
            <option value="" disabled>
              Selecione…
            </option>
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {TIPO_LABELS[t]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Frequência" required>
          <Select
            value={frequencia}
            onChange={(e) => setFrequencia(e.target.value)}
            disabled={editando}
          >
            {FREQUENCIAS.map((f) => (
              <option key={f} value={f}>
                {FREQ_LABELS[f]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <EditorItens itens={itens} onChange={setItens} />

      {erro && <p className="ct-error">{erro}</p>}
      {mutation.isError && (
        <p className="text-[14px]" style={{ color: 'var(--danger)' }}>
          {mensagemErro(mutation.error)}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={mutation.isPending}>
          {mutation.isPending ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
