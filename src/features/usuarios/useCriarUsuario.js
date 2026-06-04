import { useMutation, useQueryClient } from '@tanstack/react-query'
import { criarUsuario } from './criarUsuario'

// Mutation para criar usuário via Edge Function. Ao criar, invalida as duas
// listas que mostram usuários: ['usuarios'] (a tabela do painel, via
// useUsuarios) e ['perfis'] (o dropdown de responsável de setor, via
// usePerfis) — senão a nova linha só aparece após recarregar a página.
export function useCriarUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: criarUsuario,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] })
      qc.invalidateQueries({ queryKey: ['perfis'] })
    },
  })
}
