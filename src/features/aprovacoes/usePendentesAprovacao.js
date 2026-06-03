import { useQuery } from '@tanstack/react-query'
import { contarPendentesAprovacao } from './aprovacoesQueries'

// Contagem de serviços pendentes de aprovação. Só busca quando habilitado
// (o badge/aviso é admin-only). A chave fica sob ['manutencoes'] para ser
// invalidada junto com registrar/aprovar/reprovar.
export function usePendentesAprovacao(habilitado) {
  return useQuery({
    queryKey: ['manutencoes', 'pendentes', 'count'],
    queryFn: contarPendentesAprovacao,
    enabled: habilitado,
  })
}
