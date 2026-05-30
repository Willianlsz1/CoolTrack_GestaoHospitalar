import { useState } from 'react'
import { useCriarEquipamento } from './useCriarEquipamento'

// Valores espelham os CHECK do banco — o <select> impede valor inválido
// na origem; o CHECK é a segunda linha de defesa.
const TIPOS = [
  'geladeira',
  'freezer',
  'camara_fria',
  'ar_condicionado',
  'climatizador',
  'outro',
]
const STATUS = ['ativo', 'manutencao', 'inativo']

const inputCls =
  'w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100'
const labelCls = 'block text-sm text-gray-300 mb-1'

export default function EquipamentosForm({ onSucesso, onCancelar }) {
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('')
  const [status, setStatus] = useState('ativo')
  const [setor, setSetor] = useState('')
  const [erroValidacao, setErroValidacao] = useState('')

  const criar = useCriarEquipamento()

  function handleSubmit(e) {
    e.preventDefault()

    // Validação mínima no cliente.
    if (nome.trim() === '') {
      setErroValidacao('Informe o nome do equipamento.')
      return
    }
    if (tipo === '') {
      setErroValidacao('Selecione o tipo do equipamento.')
      return
    }
    setErroValidacao('')

    criar.mutate(
      {
        nome: nome.trim(),
        tipo,
        status,
        // Campo opcional: vazio vira null em vez de string vazia.
        setor: setor.trim() === '' ? null : setor.trim(),
      },
      { onSuccess: onSucesso },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls} htmlFor="nome">
          Nome *
        </label>
        <input
          id="nome"
          className={inputCls}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </div>

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
        <label className={labelCls} htmlFor="status">
          Status
        </label>
        <select
          id="status"
          className={inputCls}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls} htmlFor="setor">
          Setor
        </label>
        <input
          id="setor"
          className={inputCls}
          value={setor}
          onChange={(e) => setSetor(e.target.value)}
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
