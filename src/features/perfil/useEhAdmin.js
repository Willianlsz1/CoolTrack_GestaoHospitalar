import { useMeuPerfil } from './useMeuPerfil'

// O usuário logado é admin? Deriva do perfil (que já traz `role`), sem
// chamada extra. Usado para mostrar/ocultar áreas só-admin no app.
export function useEhAdmin() {
  const { data: perfil, isPending } = useMeuPerfil()
  return { ehAdmin: perfil?.role === 'admin', carregando: isPending }
}
