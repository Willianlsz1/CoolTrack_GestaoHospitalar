import { useState } from 'react'
import Modal from '../../components/Modal'
import { inputCls, labelCls } from '../../components/ui'
import { useMeuPerfil } from './useMeuPerfil'
import { useAtualizarMeuNome } from './useAtualizarMeuNome'

export default function PerfilModal({ onClose }) {
  const { data: perfil, isPending } = useMeuPerfil()

  return (
    <Modal titulo="Meu perfil" onClose={onClose}>
      {isPending ? (
        <p className="text-gray-400">Carregando…</p>
      ) : (
        <FormularioPerfil perfil={perfil} onClose={onClose} />
      )}
    </Modal>
  )
}

// Só monta depois do perfil carregado, então o useState já inicializa
// com o nome atual (sem precisar de useEffect).
function FormularioPerfil({ perfil, onClose }) {
  const atualizar = useAtualizarMeuNome()
  const [nome, setNome] = useState(perfil?.nome ?? '')

  function handleSubmit(e) {
    e.preventDefault()
    atualizar.mutate(nome.trim(), { onSuccess: onClose })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-500">{perfil?.email}</p>
      <div>
        <label className={labelCls} htmlFor="perfil-nome">
          Nome
        </label>
        <input
          id="perfil-nome"
          className={inputCls}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </div>

      {atualizar.isError && (
        <p className="text-sm text-red-400">Erro: {atualizar.error.message}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded px-4 py-2 text-gray-300 hover:bg-gray-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={atualizar.isPending}
          className="rounded bg-cyan-500 px-4 py-2 font-medium text-gray-950 disabled:opacity-50"
        >
          {atualizar.isPending ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
