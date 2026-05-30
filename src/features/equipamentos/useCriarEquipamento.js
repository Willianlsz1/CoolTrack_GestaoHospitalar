import { useMutation, useQueryClient } from '@tanstack/react-query'
import { criarEquipamento } from './equipamentosQueries'
import { enviarFoto, removerFotoPorUrl } from '../../core/storage'

// Hook de mutation: (1) se houver foto, sobe a foto e pega a URL;
// (2) insere o equipamento com essa foto_url. As duas etapas ficam
// dentro do mesmo mutationFn, então um único isPending/isError cobre
// upload + insert. No sucesso, INVALIDA a chave ['equipamentos'] —
// marcar o cache como velho faz o useEquipamentos() re-buscar sozinho.
export function useCriarEquipamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ foto, ...dados }) => {
      let foto_url = null
      if (foto) {
        foto_url = await enviarFoto(foto)
      }
      try {
        return await criarEquipamento({ ...dados, foto_url })
      } catch (e) {
        // Insert falhou: remove a foto recém-enviada para não deixar órfã.
        if (foto_url) await removerFotoPorUrl(foto_url).catch(() => {})
        throw e
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] })
    },
  })
}
