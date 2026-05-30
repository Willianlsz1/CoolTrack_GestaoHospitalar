import { useMutation, useQueryClient } from '@tanstack/react-query'
import { excluirEquipamento } from './equipamentosQueries'
import { removerFotoPorUrl } from './equipamentosStorage'
import { excluirManutencoesDoEquipamento } from '../manutencoes/manutencoesQueries'

// Hook de mutation: recebe { id, foto_url, comManutencoes }. Se
// comManutencoes, apaga primeiro as manutenções (cascata controlada),
// depois o equipamento e, best-effort, a foto do Storage (erro de
// limpeza é engolido). No sucesso, invalida o cache.
export function useExcluirEquipamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, foto_url, comManutencoes }) => {
      if (comManutencoes) {
        await excluirManutencoesDoEquipamento(id)
      }
      await excluirEquipamento(id)
      await removerFotoPorUrl(foto_url).catch(() => {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] })
    },
  })
}
