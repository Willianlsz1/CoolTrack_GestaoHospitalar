import { useState } from 'react'
import { entrar, criarConta } from './authApi'
import { inputCls, labelCls } from '../../components/ui'

// Tela de entrada. Alterna entre "Entrar" e "Criar conta". No sucesso do
// login, o onAuthStateChange (AuthProvider) atualiza a sessão e o app
// aparece sozinho — esta tela some.
export default function LoginPage() {
  const [criando, setCriando] = useState(false)
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
        await criarConta(email, senha)
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
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4 text-gray-100">
      <div className="w-full max-w-sm rounded-lg border border-gray-800 bg-gray-900 p-6">
        <div className="mb-6 flex items-center gap-2 text-lg font-bold text-cyan-400">
          <span aria-hidden="true">❄</span>
          <span>CoolTrack</span>
        </div>
        <h1 className="mb-4 text-xl font-semibold">
          {criando ? 'Criar conta' : 'Entrar'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls} htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="senha">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              className={inputCls}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          {erro && <p className="text-sm text-red-400">{erro}</p>}
          {mensagem && <p className="text-sm text-green-400">{mensagem}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded bg-cyan-500 px-4 py-2 font-medium text-gray-950 hover:bg-cyan-400 disabled:opacity-50"
          >
            {enviando ? '…' : criando ? 'Criar conta' : 'Entrar'}
          </button>
        </form>

        <button
          onClick={() => {
            setCriando(!criando)
            setErro('')
            setMensagem('')
          }}
          className="mt-4 text-sm text-cyan-400 hover:underline"
        >
          {criando ? 'Já tem conta? Entrar' : 'Não tem conta? Criar'}
        </button>
      </div>
    </div>
  )
}
