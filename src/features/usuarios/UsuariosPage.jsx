import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useEhAdmin } from '../perfil/useEhAdmin'
import { useCriarUsuario } from './useCriarUsuario'
import { Field } from '../../components/Field'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'

// Página de gestão de usuários (só admin). A trava REAL é na Edge Function
// (server-side); aqui o bloqueio é UX/defesa — esconde o formulário de quem
// não é admin.
export default function UsuariosPage() {
  const { ehAdmin, carregando } = useEhAdmin()

  if (carregando) return <p className="t-secondary">Carregando…</p>

  if (!ehAdmin) {
    return (
      <div>
        <h1>Usuários</h1>
        <p className="t-secondary mt-2">
          Acesso restrito — apenas administradores podem gerenciar usuários.
        </p>
      </div>
    )
  }

  return <FormularioNovoUsuario />
}

function FormularioNovoUsuario() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erroValidacao, setErroValidacao] = useState('')
  const [sucesso, setSucesso] = useState('')
  const criar = useCriarUsuario()

  function handleSubmit(e) {
    e.preventDefault()
    setSucesso('')

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

    const emailLimpo = email.trim()
    criar.mutate(
      { nome: nome.trim(), email: emailLimpo, senha },
      {
        onSuccess: () => {
          setSucesso(`Usuário ${emailLimpo} criado como técnico.`)
          setNome('')
          setEmail('')
          setSenha('')
        },
      },
    )
  }

  return (
    <div className="max-w-[440px]">
      <h1>Usuários</h1>
      <p className="t-secondary mt-1">Criar acesso para um novo técnico.</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
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
          hint="Mínimo 6 caracteres. O técnico pode trocar depois."
        >
          <Input
            type="text"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </Field>

        {erroValidacao && <p className="ct-error">{erroValidacao}</p>}
        {criar.isError && (
          <p className="text-[13px]" style={{ color: 'var(--danger)' }}>
            {criar.error.message}
          </p>
        )}
        {sucesso && (
          <p className="text-[13px]" style={{ color: 'var(--ok)' }}>
            {sucesso}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          icon={UserPlus}
          disabled={criar.isPending}
        >
          {criar.isPending ? 'Criando…' : 'Criar usuário'}
        </Button>
      </form>
    </div>
  )
}
