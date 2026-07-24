import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useCriarUsuario } from './useCriarUsuario'
import { Field } from '../../components/Field'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'

// Formulário de criação de usuário (dentro de um modal). A trava REAL é a
// Edge Function (server-side); o novo usuário nasce como técnico. Ao criar,
// o hook invalida a lista e o modal fecha (a nova linha é o feedback).
export default function UsuarioForm({ onSucesso, onCancelar }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erroValidacao, setErroValidacao] = useState('')
  const criar = useCriarUsuario()

  function handleSubmit(e) {
    e.preventDefault()

    if (nome.trim() === '') {
      setErroValidacao('Informe o nome.')
      return
    }
    if (email.trim() === '') {
      setErroValidacao('Informe o e-mail.')
      return
    }
    if (senha.length < 6) {
      setErroValidacao('A senha deve ter ao menos 6 caracteres.')
      return
    }
    setErroValidacao('')

    criar.mutate(
      { nome: nome.trim(), email: email.trim(), senha },
      { onSuccess: onSucesso },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Nome" required>
        <Input value={nome} onChange={(e) => setNome(e.target.value)} />
      </Field>
      <Field label="E-mail" required>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field
        label="Senha provisória"
        required
        hint="Mínimo 6 caracteres. O técnico terá de definir a sua própria no primeiro acesso."
      >
        <Input
          type="text"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
      </Field>

      {erroValidacao && <p className="ct-error">{erroValidacao}</p>}
      {criar.isError && (
        <p className="text-[14px]" style={{ color: 'var(--danger)' }}>
          {criar.error.message}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          icon={UserPlus}
          disabled={criar.isPending}
        >
          {criar.isPending ? 'Criando…' : 'Criar usuário'}
        </Button>
      </div>
    </form>
  )
}
