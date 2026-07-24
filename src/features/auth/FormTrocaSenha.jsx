import { useState } from 'react'
import { useTrocarSenha } from './useTrocarSenha'
import { validarNovaSenha, MIN_SENHA } from './senhaRegras'
import { Field } from '../../components/Field'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'

// Formulário de troca de senha. Usado nos dois lugares em que ela acontece:
// a troca OBRIGATÓRIA do primeiro acesso (TrocaSenhaObrigatoria) e a troca
// voluntária dentro do "Meu perfil". A diferença entre os dois é só o botão
// de cancelar — por isso um componente só.
export function FormTrocaSenha({ onSucesso, onCancelar, textoBotao }) {
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erroLocal, setErroLocal] = useState(null)
  const trocar = useTrocarSenha()

  function handleSubmit(e) {
    e.preventDefault()
    const erro = validarNovaSenha(senha, confirmacao)
    setErroLocal(erro)
    if (erro) return

    trocar.mutate(senha, { onSuccess: onSucesso })
  }

  const erro = erroLocal ?? (trocar.isError ? trocar.error.message : null)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Nova senha">
        <Input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoComplete="new-password"
          minLength={MIN_SENHA}
          required
        />
      </Field>

      <Field label="Repita a nova senha">
        <Input
          type="password"
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          autoComplete="new-password"
          required
        />
      </Field>

      {erro && (
        <p
          role="alert"
          className="text-[14px]"
          style={{ color: 'var(--danger)' }}
        >
          {erro}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        {onCancelar && (
          <Button type="button" variant="ghost" onClick={onCancelar}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={trocar.isPending}>
          {trocar.isPending ? 'Salvando…' : textoBotao}
        </Button>
      </div>
    </form>
  )
}
