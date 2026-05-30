import { useMutation, useQueryClient } from '@tanstack/react-query'
import { atualizarEquipamento } from './equipamentosQueries'
import { enviarFoto, removerFotoPorUrl } from '../../core/storage'

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
      let novaFotoUrl = null
      if (foto) {
        novaFotoUrl = await enviarFoto(foto)
        patch.foto_url = novaFotoUrl
      } else if (removerFoto) {
        patch.foto_url = null
      }

      let atualizado
      try {
        atualizado = await atualizarEquipamento(id, patch)
      } catch (e) {
        // Update falhou: remove a foto nova recém-enviada (a antiga fica).
        if (novaFotoUrl) await removerFotoPorUrl(novaFotoUrl).catch(() => {})
        throw e
      }

      // Sucesso: se a foto mudou (troca ou remoção), apaga a antiga.
      if ((foto || removerFoto) && fotoAntiga) {
        await removerFotoPorUrl(fotoAntiga).catch(() => {})
      }
      return atualizado
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] })
    },
  })
}
