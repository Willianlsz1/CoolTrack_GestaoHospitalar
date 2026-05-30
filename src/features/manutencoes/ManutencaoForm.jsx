import { useState } from 'react'
import { useCriarManutencao } from './useCriarManutencao'

const TIPOS = ['preventiva', 'corretiva', 'preditiva']

const inputCls =
  'w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100'
const labelCls = 'block text-sm text-gray-300 mb-1'

// Data de hoje em YYYY-MM-DD para o valor inicial do input date.
const hoje = () => new Date().toISOString().slice(0, 10)

export default function ManutencaoForm({
  equipamentoId,
  onSucesso,
  onCancelar,
}) {
  const [tipo, setTipo] = useState('')
  const [data, setData] = useState(hoje())
  const [tecnico, setTecnico] = useState('')
  const [descricao, setDescricao] = useState('')
  const [pecas, setPecas] = useState('')
  const [proxima, setProxima] = useState('')
  const [erroValidacao, setErroValidacao] = useState('')

  const criar = useCriarManutencao()

  function handleSubmit(e) {
    e.preventDefault()

    if (tipo === '') {
      setErroValidacao('Selecione o tipo da manutenção.')
      return
    }
    if (data === '') {
      setErroValidacao('Informe a data.')
      return
    }
    setErroValidacao('')

    criar.mutate(
      {
        equipamento_id: equipamentoId,
        tipo,
        data,
        // Opcionais: vazio vira null.
        tecnico: tecnico.trim() || null,
        descricao: descricao.trim() || null,
        pecas: pecas.trim() || null,
        proxima_manutencao: proxima || null,
      },
      { onSuccess: onSucesso },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls} htmlFor="tipo">
          Tipo *
        </label>
        <select
          id="tipo"
          className={inputCls}
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="">Selecione…</option>
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls} htmlFor="data">
          Data *
        </label>
        <input
          id="data"
          type="date"
          className={inputCls}
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="tecnico">
          Técnico
        </label>
        <input
          id="tecnico"
          className={inputCls}
          value={tecnico}
          onChange={(e) => setTecnico(e.target.value)}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="descricao">
          Descrição
        </label>
        <textarea
          id="descricao"
          rows={3}
          className={inputCls}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="pecas">
          Peças trocadas
        </label>
        <input
          id="pecas"
          className={inputCls}
          value={pecas}
          onChange={(e) => setPecas(e.target.value)}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="proxima">
          Próxima manutenção
        </label>
        <input
          id="proxima"
          type="date"
          className={inputCls}
          value={proxima}
          onChange={(e) => setProxima(e.target.value)}
        />
      </div>

      {erroValidacao && (
        <p className="text-sm text-yellow-400">{erroValidacao}</p>
      )}
      {criar.isError && (
        <p className="text-sm text-red-400">
          Erro ao salvar: {criar.error.message}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancelar}
          className="rounded px-4 py-2 text-gray-300 hover:bg-gray-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={criar.isPending}
          className="rounded bg-cyan-500 px-4 py-2 font-medium text-gray-950 disabled:opacity-50"
        >
          {criar.isPending ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
