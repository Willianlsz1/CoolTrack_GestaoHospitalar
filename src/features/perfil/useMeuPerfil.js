import { useQuery } from '@tanstack/react-query'
import { buscarMeuPerfil } from './perfilQueries'

export function useMeuPerfil() {
  return useQuery({
    queryKey: ['perfil', 'meu'],
    queryFn: buscarMeuPerfil,
  })
}
