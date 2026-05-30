import { useQuery } from '@tanstack/react-query'
import { buscarTodasManutencoes } from './dashboardQueries'

// Todas as manutenções (para as agregações do dashboard).
export function useTodasManutencoes() {
  return useQuery({
    queryKey: ['manutencoes', 'todas'],
    queryFn: buscarTodasManutencoes,
  })
}
