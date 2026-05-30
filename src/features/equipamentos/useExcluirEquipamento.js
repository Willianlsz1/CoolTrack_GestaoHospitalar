import { useMutation, useQueryClient } from '@tanstack/react-query'
import { excluirEquipamento } from './equipamentosQueries'
import { removerFotoPorUrl } from './equipamentosStorage'

// Hook de mutation: recebe { id, foto_url }. Primeiro exclui a linha;
// depois, best-effort, apaga a foto do Storage (erro de limpeza é
// engolido para não falhar a exclusão). No sucesso, invalida o cache.
export function useExcluirEquipamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, foto_url }) => {
      await excluirEquipamento(id)
      await removerFotoPorUrl(foto_url).catch(() => {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] })
    },
  })
}
