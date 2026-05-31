import { useState } from 'react'
import { Snowflake } from 'lucide-react'
import { entrar } from './authApi'
import { Field } from '../../components/Field'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'

// Tela de entrada. Só login — a criação de contas é feita por um admin
// (painel de usuários); o cadastro público está desativado no Supabase.
// No sucesso, o onAuthStateChange (AuthProvider) atualiza a sessão e o
// app aparece sozinho — esta tela some.
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await entrar(email, senha)
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-4">
      <div className="ct-card ct-card--pad24 w-full max-w-[360px]">
        <div className="mb-6 flex items-center gap-2">
          <Snowflake size={20} style={{ color: 'var(--link)' }} />
          <span className="text-[18px] font-medium">CoolTrack</span>
        </div>
        <h1 className="mb-5">Entrar</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="E-mail">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Senha">
            <Input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </Field>

          {erro && <p className="ct-error">{erro}</p>}

          <Button
            type="submit"
            variant="primary"
            disabled={enviando}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {enviando ? '…' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
