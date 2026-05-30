import { useMutation, useQueryClient } from '@tanstack/react-query'
import { atualizarEquipamento } from './equipamentosQueries'
import { enviarFotoEquipamento } from './equipamentosStorage'

// Hook de mutation para EDITAR. Recebe { id, foto, removerFoto, ...dados }:
// - foto NOVA escolhida  -> sobe e troca a foto_url (ganha de tudo);
// - senão removerFoto     -> grava foto_url = null;
// - senão                 -> foto_url nem entra e a foto atual é mantida.
// No sucesso, invalida ['equipamentos'].
export function useAtualizarEquipamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, foto, removerFoto, ...dados }) => {
      const patch = { ...dados }
      if (foto) {
        patch.foto_url = await enviarFotoEquipamento(foto)
      } else if (removerFoto) {
        patch.foto_url = null
      }
      return atualizarEquipamento(id, patch)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] })
    },
  })
}
