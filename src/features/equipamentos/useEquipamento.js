import { useQuery } from '@tanstack/react-query'
import { buscarEquipamentoPorId } from './equipamentosQueries'

// Busca UM equipamento pelo id. A queryKey ['equipamentos', id] é
// "filha" da lista — fica organizada e separada no cache.
export function useEquipamento(id) {
  return useQuery({
    queryKey: ['equipamentos', id],
    queryFn: () => buscarEquipamentoPorId(id),
  })
}
