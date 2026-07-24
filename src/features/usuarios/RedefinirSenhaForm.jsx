import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { useRedefinirSenha } from './useRedefinirSenha'
import { Field } from '../../components/Field'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'

// Redefinição da senha de OUTRO usuário (só admin, dentro de um modal). A
// trava real é a Edge Function; aqui é coleta e feedback.
//
// A senha digitada aqui é temporária de propósito: a função zera
// senha_trocada_em, então a pessoa cai na tela de troca no próximo acesso e
// escolhe uma que só ela conheça.
export default function RedefinirSenhaForm({ usuario, onSucesso, onCancelar }) {
  const [senha, setSenha] = useState('')
  const [erroValidacao, setErroValidacao] = useState('')
  const redefinir = useRedefinirSenha()

  function handleSubmit(e) {
    e.preventDefault()

    if (senha.length < 6) {
      setErroValidacao('A senha deve ter ao menos 6 caracteres.')
      return
    }
    setErroValidacao('')

    redefinir.mutate({ usuarioId: usuario.id, senha }, { onSuccess: onSucesso })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="t-secondary -mt-1">
        {usuario.nome || usuario.email} vai entrar com esta senha e será
        obrigado a definir uma própria antes de usar o app.
      </p>

      <Field
        label="Senha provisória"
        required
        hint="Mínimo 6 caracteres. Combine com a pessoa por um canal seguro."
      >
        <Input
          type="text"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
      </Field>

      {erroValidacao && <p className="ct-error">{erroValidacao}</p>}
      {redefinir.isError && (
        <p className="text-[14px]" style={{ color: 'var(--danger)' }}>
          {redefinir.error.message}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          icon={KeyRound}
          disabled={redefinir.isPending}
        >
          {redefinir.isPending ? 'Redefinindo…' : 'Redefinir senha'}
        </Button>
      </div>
    </form>
  )
}
