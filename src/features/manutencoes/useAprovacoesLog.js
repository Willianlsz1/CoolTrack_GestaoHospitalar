import { useQuery } from '@tanstack/react-query'
import { buscarAprovacoesLog } from './aprovacaoQueries'

// Trilha de decisões de um serviço. `habilitado` posterga a consulta até o
// histórico ser aberto — evita disparar uma query por card ao renderizar a fila.
export function useAprovacoesLog(manutencaoId, habilitado) {
  return useQuery({
    queryKey: ['aprovacoes_log', manutencaoId],
    queryFn: () => buscarAprovacoesLog(manutencaoId),
    enabled: habilitado,
  })
}
