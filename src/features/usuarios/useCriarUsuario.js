import { useMutation, useQueryClient } from '@tanstack/react-query'
import { criarUsuario } from './criarUsuario'

// Mutation para criar usuário via Edge Function. Ao criar, invalida a
// lista de perfis para a tabela de Usuários se atualizar sozinha.
export function useCriarUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: criarUsuario,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['perfis'] }),
  })
}
