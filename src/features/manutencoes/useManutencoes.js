import { useQuery } from '@tanstack/react-query'
import { buscarManutencoes } from './manutencoesQueries'

// Histórico de manutenções de um equipamento. A queryKey leva o
// equipamentoId, então cada equipamento tem seu próprio cache.
export function useManutencoes(equipamentoId) {
  return useQuery({
    queryKey: ['manutencoes', equipamentoId],
    queryFn: () => buscarManutencoes(equipamentoId),
  })
}
