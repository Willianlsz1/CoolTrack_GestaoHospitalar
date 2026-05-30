import { useMutation, useQueryClient } from '@tanstack/react-query'
import { criarManutencao } from './manutencoesQueries'

// Registra uma manutenção e invalida APENAS a chave do equipamento dela
// (['manutencoes', equipamento_id]) — o histórico daquele equipamento se
// atualiza sozinho, sem mexer no cache dos outros.
export function useCriarManutencao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: criarManutencao,
    onSuccess: (nova) => {
      queryClient.invalidateQueries({
        queryKey: ['manutencoes', nova.equipamento_id],
      })
    },
  })
}
