import { useState } from 'react'
import { useCriarEquipamento } from './useCriarEquipamento'
import { useAtualizarEquipamento } from './useAtualizarEquipamento'
import { inputCls, labelCls, fileCls } from '../../components/ui'
import { TIPOS, STATUS, TIPO_LABELS, STATUS_LABELS } from './rotulos'

// Limite de tamanho da foto (5 MB). O accept="image/*" já restringe o tipo.
const MAX_FOTO_BYTES = 5 * 1024 * 1024

// Form reaproveitado nos dois modos:
// - sem `equipamento`  -> modo CRIAR
// - com `equipamento`  -> modo EDITAR (pré-preenche e atualiza)
export default function EquipamentosForm({
  equipamento,
  onSucesso,
  onCancelar,
}) {
  const editando = Boolean(equipamento)

  // Os estados iniciais vêm do equipamento quando editando. O form é
  // remontado a cada abertura do modal, então o pré-preenchimento
  // funciona a cada vez.
  const [nome, setNome] = useState(equipamento?.nome ?? '')
  const [tipo, setTipo] = useState(equipamento?.tipo ?? '')
  const [status, setStatus] = useState(equipamento?.status ?? 'ativo')
  const [setor, setSetor] = useState(equipamento?.setor ?? '')
  const [foto, setFoto] = useState(null)
  const [removerFoto, setRemoverFoto] = useState(false)
  const [erroValidacao, setErroValidacao] = useState('')

  const criar = useCriarEquipamento()
  const atualizar = useAtualizarEquipamento()
  // A mutation ativa do momento — usada para loading/erro.
  const mutation = editando ? atualizar : criar

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
    if (foto && foto.size > MAX_FOTO_BYTES) {
      setErroValidacao('Foto muito grande (máx. 5 MB).')
      return
    }
    setErroValidacao('')

    const dados = {
      nome: nome.trim(),
      tipo,
      status,
      // Campo opcional: vazio vira null em vez de string vazia.
      setor: setor.trim() === '' ? null : setor.trim(),
    }

    if (editando) {
      // foto nova = troca; senão removerFoto = limpa; senão mantém.
      // fotoAntiga permite ao hook apagar o arquivo trocado/removido.
      atualizar.mutate(
        {
          id: equipamento.id,
          foto,
          removerFoto,
          fotoAntiga: equipamento.foto_url,
          ...dados,
        },
        { onSuccess: onSucesso },
      )
    } else {
      criar.mutate({ foto, ...dados }, { onSuccess: onSucesso })
    }
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
              {TIPO_LABELS[t]}
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
              {STATUS_LABELS[s]}
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

      <div>
        <label className={labelCls} htmlFor="foto">
          Foto
        </label>
        {editando && equipamento.foto_url && (
          <img
            src={equipamento.foto_url}
            alt={equipamento.nome}
            className={`mb-2 h-20 w-full rounded object-cover ${
              removerFoto ? 'opacity-30' : ''
            }`}
          />
        )}
        <input
          id="foto"
          type="file"
          accept="image/*"
          className={fileCls}
          onChange={(e) => setFoto(e.target.files[0] ?? null)}
        />
        {editando && equipamento.foto_url && (
          <label className="mt-2 flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={removerFoto}
              onChange={(e) => setRemoverFoto(e.target.checked)}
            />
            Remover foto atual
          </label>
        )}
        {editando && (
          <p className="mt-1 text-xs text-gray-500">
            Deixe vazio para manter a foto atual.
          </p>
        )}
      </div>

      {erroValidacao && (
        <p className="text-sm text-yellow-400">{erroValidacao}</p>
      )}
      {mutation.isError && (
        <p className="text-sm text-red-400">
          Erro ao salvar: {mutation.error.message}
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
          disabled={mutation.isPending}
          className="rounded bg-cyan-500 px-4 py-2 font-medium text-gray-950 disabled:opacity-50"
        >
          {mutation.isPending ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
