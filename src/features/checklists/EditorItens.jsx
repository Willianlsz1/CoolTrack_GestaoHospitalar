import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'

const iconBtn =
  'rounded-[var(--r)] p-1.5 text-[var(--fg-3)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)] disabled:opacity-40'

// Editor da lista ORDENADA de itens do checklist. Controlado: recebe `itens`
// e devolve a lista nova via onChange. Cada item é { procedimento, servico }.
export function EditorItens({ itens, onChange }) {
  function atualizar(i, campo, valor) {
    onChange(
      itens.map((it, idx) => (idx === i ? { ...it, [campo]: valor } : it)),
    )
  }
  function adicionar() {
    onChange([...itens, { procedimento: '', servico: '' }])
  }
  function remover(i) {
    onChange(itens.filter((_, idx) => idx !== i))
  }
  function mover(i, delta) {
    const j = i + delta
    if (j < 0 || j >= itens.length) return
    const novo = itens.slice()
    ;[novo[i], novo[j]] = [novo[j], novo[i]]
    onChange(novo)
  }

  return (
    <div className="space-y-2">
      <span className="ct-label">Itens do checklist</span>
      {itens.length === 0 && (
        <p className="t-caption">Nenhum item ainda — adicione o primeiro.</p>
      )}

      {itens.map((it, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2 w-5 flex-none text-right text-[13px] text-[var(--fg-3)]">
            {i + 1}.
          </span>
          <div className="flex-1">
            <Input
              placeholder="Procedimento (ex.: Limpeza do evaporador com água)"
              value={it.procedimento}
              onChange={(e) => atualizar(i, 'procedimento', e.target.value)}
            />
          </div>
          <div className="w-36 flex-none">
            <Input
              placeholder="Serviço"
              value={it.servico}
              onChange={(e) => atualizar(i, 'servico', e.target.value)}
            />
          </div>
          <div className="flex flex-none">
            <button
              type="button"
              aria-label="Mover para cima"
              disabled={i === 0}
              onClick={() => mover(i, -1)}
              className={iconBtn}
            >
              <ChevronUp size={16} />
            </button>
            <button
              type="button"
              aria-label="Mover para baixo"
              disabled={i === itens.length - 1}
              onClick={() => mover(i, 1)}
              className={iconBtn}
            >
              <ChevronDown size={16} />
            </button>
            <button
              type="button"
              aria-label="Remover item"
              onClick={() => remover(i)}
              className={iconBtn}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        icon={Plus}
        onClick={adicionar}
      >
        Adicionar item
      </Button>
    </div>
  )
}
