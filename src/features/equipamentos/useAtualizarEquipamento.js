import { useMutation, useQueryClient } from '@tanstack/react-query'
import { atualizarEquipamento } from './equipamentosQueries'
import { enviarFotoEquipamento, removerFotoPorUrl } from './equipamentosStorage'

// Hook de mutation para EDITAR. Recebe { id, foto, removerFoto,
// fotoAntiga, ...dados }:
// - foto NOVA escolhida  -> sobe e troca a foto_url (ganha de tudo);
// - senão removerFoto     -> grava foto_url = null;
// - senão                 -> foto_url nem entra e a foto atual é mantida.
// Quando a foto muda (troca ou remoção), apaga a antiga do Storage
// best-effort (erro de limpeza é engolido). No sucesso, invalida o cache.
export function useAtualizarEquipamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, foto, removerFoto, fotoAntiga, ...dados }) => {
      const patch = { ...dados }
      let fotoMudou = false
      if (foto) {
        patch.foto_url = await enviarFotoEquipamento(foto)
        fotoMudou = true
      } else if (removerFoto) {
        patch.foto_url = null
        fotoMudou = true
      }

      const atualizado = await atualizarEquipamento(id, patch)

      if (fotoMudou && fotoAntiga) {
        await removerFotoPorUrl(fotoAntiga).catch(() => {})
      }
      return atualizado
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] })
    },
  })
}
