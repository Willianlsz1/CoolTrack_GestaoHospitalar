import { useState } from 'react'
import Modal from '../../components/Modal'
import { Field } from '../../components/Field'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { useMeuPerfil } from './useMeuPerfil'
import { useAtualizarMeuNome } from './useAtualizarMeuNome'

export default function PerfilModal({ onClose }) {
  const { data: perfil, isPending } = useMeuPerfil()

  return (
    <Modal titulo="Meu perfil" onClose={onClose}>
      {isPending ? (
        <p className="t-secondary">Carregando…</p>
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
      <p className="t-caption">{perfil?.email}</p>

      <Field label="Nome">
        <Input value={nome} onChange={(e) => setNome(e.target.value)} />
      </Field>

      {atualizar.isError && (
        <p className="text-[14px]" style={{ color: 'var(--danger)' }}>
          Erro: {atualizar.error.message}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={atualizar.isPending}>
          {atualizar.isPending ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
