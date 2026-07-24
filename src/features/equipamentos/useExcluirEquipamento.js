import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  excluirEquipamento,
  excluirEquipamentoEmCascata,
} from './equipamentosQueries'
import { removerFoto } from '../../core/storage'
import { buscarCaminhosFotosManutencoes } from '../manutencoes/manutencoesQueries'

// Hook de mutation: recebe { id, foto_url, comManutencoes }. Se
// comManutencoes, usa a função atômica do banco (apaga manutenções +
// equipamento numa transação); senão, exclui só o equipamento. Depois,
// best-effort, apaga a foto. No sucesso, invalida a lista e o histórico.
export function useExcluirEquipamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, foto_url, comManutencoes }) => {
      // Na cascata, guarda os caminhos das fotos de manutenção ANTES de
      // apagar as linhas — depois removemos os arquivos do Storage.
      let fotosManutencoes = []
      if (comManutencoes) {
        fotosManutencoes = await buscarCaminhosFotosManutencoes(id)
        await excluirEquipamentoEmCascata(id)
      } else {
        await excluirEquipamento(id)
      }

      // Limpeza best-effort dos arquivos (foto do equipamento + das
      // manutenções). Erro de Storage não falha a exclusão.
      await removerFoto(foto_url).catch(() => {})
      for (const caminho of fotosManutencoes) {
        await removerFoto(caminho).catch(() => {})
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] })
      // Amplo: cobre o histórico do equipamento e o ['manutencoes', 'todas'].
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] })
    },
  })
}
