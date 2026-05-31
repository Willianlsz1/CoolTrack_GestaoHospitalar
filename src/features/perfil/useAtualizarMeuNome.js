import { useMutation, useQueryClient } from '@tanstack/react-query'
import { atualizarMeuNome } from './perfilQueries'

// Atualiza o nome e invalida o perfil E as manutenções (que mostram o
// nome via relação — precisam re-buscar para refletir a mudança).
export function useAtualizarMeuNome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: atualizarMeuNome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfil'] })
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] })
    },
  })
}
