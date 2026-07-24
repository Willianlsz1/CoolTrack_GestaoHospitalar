import { useState } from 'react'
import Modal from '../../components/Modal'
import { Field } from '../../components/Field'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { useMeuPerfil } from './useMeuPerfil'
import { useAtualizarMeuNome } from './useAtualizarMeuNome'
import { FormTrocaSenha } from '../auth/FormTrocaSenha'
import { useToast } from '../feedback/useToast'
import { Carregando } from '../../components/Estado'

export default function PerfilModal({ onClose }) {
  const { data: perfil, isPending } = useMeuPerfil()

  return (
    <Modal titulo="Meu perfil" onClose={onClose}>
      {isPending ? (
        <Carregando />
      ) : (
        <>
          {/* O e-mail identifica a conta nos dois modos (editar nome e
              trocar senha), então mora aqui e não dentro de cada um. */}
          <p className="t-caption mb-4">{perfil?.email}</p>
          <FormularioPerfil perfil={perfil} onClose={onClose} />
        </>
      )}
    </Modal>
  )
}

// Só monta depois do perfil carregado, então o useState já inicializa
// com o nome atual (sem precisar de useEffect).
function FormularioPerfil({ perfil, onClose }) {
  const atualizar = useAtualizarMeuNome()
  const toast = useToast()
  const [nome, setNome] = useState(perfil?.nome ?? '')
  const [trocandoSenha, setTrocandoSenha] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    atualizar.mutate(nome.trim(), { onSuccess: onClose })
  }

  // Um formulário OU o outro — <form> dentro de <form> não é HTML válido, e
  // misturar "salvar nome" com "salvar senha" no mesmo submit confundiria o
  // que cada botão faz.
  if (trocandoSenha) {
    return (
      <div className="space-y-4">
        <FormTrocaSenha
          textoBotao="Trocar senha"
          onCancelar={() => setTrocandoSenha(false)}
          onSucesso={() => {
            toast.sucesso('Senha alterada.')
            onClose()
          }}
        />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Nome">
        <Input value={nome} onChange={(e) => setNome(e.target.value)} />
      </Field>

      <button
        type="button"
        onClick={() => setTrocandoSenha(true)}
        className="ct-link text-[14px]"
      >
        Trocar minha senha
      </button>

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
