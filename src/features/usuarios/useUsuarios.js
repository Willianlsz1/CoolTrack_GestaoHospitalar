import { useQuery } from '@tanstack/react-query'
import { listarUsuarios } from '../perfil/perfilQueries'

// Lista completa de usuários (id, nome, email, role) para o painel de admin.
// Vem da função listar_usuarios(), que recusa quem não for admin no banco.
export function useUsuarios() {
  return useQuery({ queryKey: ['usuarios'], queryFn: listarUsuarios })
}
