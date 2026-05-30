import { useEffect, useState } from 'react'
import { supabase } from '../../core/supabase'
import { SessaoContext } from './sessaoContext'

// Compartilha a sessão de autenticação com todo o app (mesmo espírito do
// QueryClientProvider, mas para a sessão). Busca a sessão atual ao montar
// e reage a login/logout em tempo real via onAuthStateChange.
export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    // Sessão atual ao carregar (ex.: usuário já estava logado).
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session)
      setCarregando(false)
    })

    // Reage a login/logout enquanto o app está aberto.
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_evento, novaSessao) => {
        setSessao(novaSessao)
      },
    )

    return () => sub.subscription.unsubscribe()
  }, [])

  return (
    <SessaoContext.Provider value={{ sessao, carregando }}>
      {children}
    </SessaoContext.Provider>
  )
}
