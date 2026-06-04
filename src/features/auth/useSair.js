import { sair } from './authApi'
import { useToast } from '../feedback/useToast'

// Logout com feedback. sair() dá throw em falha (ex.: rede); sem tratamento,
// o clique em "Sair" não faria nada visível. No sucesso não precisa toast: o
// AuthProvider reage ao SIGNED_OUT e a tela de login aparece sozinha.
export function useSair() {
  const toast = useToast()
  return async () => {
    try {
      await sair()
    } catch {
      toast.erro('Não foi possível sair. Tente de novo.')
    }
  }
}
