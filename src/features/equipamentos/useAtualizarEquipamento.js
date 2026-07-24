import { useMutation, useQueryClient } from '@tanstack/react-query'
import { atualizarEquipamento } from './equipamentosQueries'
import { enviarFoto, removerFoto } from '../../core/storage'

// Hook de mutation para EDITAR. Recebe { id, foto, removerFotoAtual,
// fotoAntiga, ...dados }:
// - foto NOVA escolhida    -> sobe e troca o foto_url (ganha de tudo);
// - senão removerFotoAtual -> grava foto_url = null;
// - senão                  -> foto_url nem entra e a foto atual é mantida.
// Quando a foto muda (troca ou remoção), TENTA apagar a antiga do Storage —
// best-effort de verdade: desde a 0028 só admin apaga arquivo, então para o
// técnico o arquivo antigo fica órfão no bucket. É o lado escolhido do
// trade-off (arquivo órfão custa centavos; evidência apagável custa a
// auditoria). No sucesso, invalida o cache.
export function useAtualizarEquipamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      foto,
      removerFotoAtual,
      fotoAntiga,
      ...dados
    }) => {
      const patch = { ...dados }
      let novoCaminho = null
      if (foto) {
        novoCaminho = await enviarFoto(foto)
        patch.foto_url = novoCaminho
      } else if (removerFotoAtual) {
        patch.foto_url = null
      }

      let atualizado
      try {
        atualizado = await atualizarEquipamento(id, patch)
      } catch (e) {
        // Update falhou: remove a foto nova recém-enviada (a antiga fica).
        if (novoCaminho) await removerFoto(novoCaminho).catch(() => {})
        throw e
      }

      // Sucesso: se a foto mudou (troca ou remoção), apaga a antiga.
      if ((foto || removerFotoAtual) && fotoAntiga) {
        await removerFoto(fotoAntiga).catch(() => {})
      }
      return atualizado
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] })
    },
  })
}
