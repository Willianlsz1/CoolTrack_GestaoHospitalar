import { useMutation, useQueryClient } from '@tanstack/react-query'
import { criarEquipamento } from './equipamentosQueries'

// Hook de mutation: insere um equipamento e, no sucesso, INVALIDA a
// chave ['equipamentos']. Invalidar = marcar o cache como velho, o que
// faz o useEquipamentos() re-buscar sozinho — a lista se atualiza sem
// recarregar a página.
export function useCriarEquipamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: criarEquipamento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] })
    },
  })
}
