import { useEffect, useState } from 'react'
import { Snowflake, Eye } from 'lucide-react'
import { entrar } from './authApi'
import {
  modoDemoAtivo,
  entrarModoDemo,
  sairModoDemo,
  DEMO_EMAIL,
  DEMO_SENHA,
} from '../../core/demoConfig'
import { Field } from '../../components/Field'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'

// Tela de entrada. Só login — a criação de contas é feita por um admin
// (painel de usuários); o cadastro público está desativado no Supabase.
// No sucesso, o onAuthStateChange (AuthProvider) atualiza a sessão e o
// app aparece sozinho — esta tela some.
//
// Modo visitante: o botão liga a flag e recarrega (o cliente Supabase
// nasce apontando para o projeto demo); nesta segunda passagem, o effect
// abaixo entra sozinho com a conta visitante — credenciais públicas por
// design, num banco que só tem dado fictício.
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const demo = modoDemoAtivo()

  useEffect(() => {
    if (!demo) return
    entrar(DEMO_EMAIL, DEMO_SENHA).catch(() => {
      // Falhou (projeto demo pausado/fora do ar?): desliga a flag para não
      // prender a pessoa num reload sem saída.
      sairModoDemo()
    })
  }, [demo])

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

  if (demo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-4">
        <p className="text-[var(--fg-2)]">Entrando como visitante…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-4">
      <div className="ct-card ct-card--pad24 w-full max-w-[360px]">
        <div className="mb-6 flex items-center gap-2">
          <Snowflake size={20} style={{ color: 'var(--link)' }} />
          <span className="text-[19px] font-medium">CoolTrack</span>
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

        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <Button
            type="button"
            onClick={entrarModoDemo}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Eye size={16} aria-hidden="true" />
            Explorar como visitante
          </Button>
          <p className="mt-2 text-center text-[13px] text-[var(--fg-2)]">
            Ambiente de demonstração com dados fictícios — nada aqui é real.
          </p>
        </div>
      </div>
    </div>
  )
}
