import { useQuery } from '@tanstack/react-query'
import { buscarManutencaoPorId } from './manutencoesQueries'

// Uma manutenção pelo id (para o documento de evidência).
export function useManutencao(id) {
  return useQuery({
    queryKey: ['manutencoes', 'item', id],
    queryFn: () => buscarManutencaoPorId(id),
  })
}
