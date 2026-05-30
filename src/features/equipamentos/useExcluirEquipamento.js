import { useMutation, useQueryClient } from '@tanstack/react-query'
import { excluirEquipamento } from './equipamentosQueries'

// Hook de mutation: exclui um equipamento pelo id e, no sucesso,
// invalida ['equipamentos'] para a lista sumir o card sozinha.
export function useExcluirEquipamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: excluirEquipamento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] })
    },
  })
}
