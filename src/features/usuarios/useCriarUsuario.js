import { useMutation } from '@tanstack/react-query'
import { criarUsuario } from './criarUsuario'

// Mutation para criar usuário via Edge Function. Não há lista de usuários
// no app ainda, então não há cache a invalidar.
export function useCriarUsuario() {
  return useMutation({ mutationFn: criarUsuario })
}
