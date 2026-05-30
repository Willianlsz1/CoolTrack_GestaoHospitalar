import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  excluirEquipamento,
  excluirEquipamentoEmCascata,
} from './equipamentosQueries'
import { removerFotoPorUrl } from '../../core/storage'

// Hook de mutation: recebe { id, foto_url, comManutencoes }. Se
// comManutencoes, usa a função atômica do banco (apaga manutenções +
// equipamento numa transação); senão, exclui só o equipamento. Depois,
// best-effort, apaga a foto. No sucesso, invalida a lista e o histórico.
export function useExcluirEquipamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, foto_url, comManutencoes }) => {
      if (comManutencoes) {
        await excluirEquipamentoEmCascata(id)
      } else {
        await excluirEquipamento(id)
      }
      await removerFotoPorUrl(foto_url).catch(() => {})
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] })
      queryClient.invalidateQueries({ queryKey: ['manutencoes', id] })
    },
  })
}
