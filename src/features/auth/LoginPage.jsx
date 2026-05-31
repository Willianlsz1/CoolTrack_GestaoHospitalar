import { useState } from 'react'
import { Snowflake } from 'lucide-react'
import { entrar, criarConta } from './authApi'
import { Field } from '../../components/Field'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'

// Tela de entrada. Alterna entre "Entrar" e "Criar conta". No sucesso do
// login, o onAuthStateChange (AuthProvider) atualiza a sessão e o app
// aparece sozinho — esta tela some.
export default function LoginPage() {
  const [criando, setCriando] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setMensagem('')
    setEnviando(true)
    try {
      if (criando) {
        await criarConta(email, senha, nome)
        // Se a confirmação por e-mail estiver ligada, não há sessão ainda.
        setMensagem(
          'Conta criada. Se a confirmação por e-mail estiver ativa, confirme antes de entrar.',
        )
      } else {
        await entrar(email, senha)
      }
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
        <h1 className="mb-5">{criando ? 'Criar conta' : 'Entrar'}</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {criando && (
            <Field label="Nome">
              <Input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </Field>
          )}
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
          {mensagem && (
            <p className="text-[13px]" style={{ color: 'var(--ok)' }}>
              {mensagem}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={enviando}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {enviando ? '…' : criando ? 'Criar conta' : 'Entrar'}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setCriando(!criando)
            setErro('')
            setMensagem('')
          }}
          className="ct-link mt-4 border-none bg-transparent p-0 text-[13px]"
        >
          {criando ? 'Já tem conta? Entrar' : 'Não tem conta? Criar'}
        </button>
      </div>
    </div>
  )
}
