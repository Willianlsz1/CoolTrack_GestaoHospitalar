import { useQuery } from '@tanstack/react-query'
import { buscarPerfis } from './perfilQueries'

// Lista de usuários (perfis), ordenada por nome. Usada no dropdown de
// responsável do setor.
export function usePerfis() {
  return useQuery({ queryKey: ['perfis'], queryFn: buscarPerfis })
}
