import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../core/supabase'
import { SessaoContext } from './sessaoContext'

// Compartilha a sessão de autenticação com todo o app (mesmo espírito do
// QueryClientProvider, mas para a sessão). Busca a sessão atual ao montar
// e reage a login/logout em tempo real via onAuthStateChange.
export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [sessao, setSessao] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    // Sessão atual ao carregar (ex.: usuário já estava logado). O finally
    // garante que carregando vira false mesmo se getSession falhar — senão
    // o app travaria em "Carregando…".
    supabase.auth
      .getSession()
      .then(({ data }) => setSessao(data.session))
      .catch(() => setSessao(null))
      .finally(() => setCarregando(false))

    // Reage a login/logout enquanto o app está aberto.
    const { data: sub } = supabase.auth.onAuthStateChange(
      (evento, novaSessao) => {
        setSessao(novaSessao)
        // No logout, limpa o cache para o próximo login não ver dados antigos.
        if (evento === 'SIGNED_OUT') {
          queryClient.clear()
        }
      },
    )

    return () => sub.subscription.unsubscribe()
  }, [queryClient])

  return (
    <SessaoContext.Provider value={{ sessao, carregando }}>
      {children}
    </SessaoContext.Provider>
  )
}
