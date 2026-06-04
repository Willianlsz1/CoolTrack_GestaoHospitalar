import { useMutation, useQueryClient } from '@tanstack/react-query'
import { criarManutencao } from './manutencoesQueries'
import { enviarFoto, removerFotoPorUrl } from '../../core/storage'

// Registra uma manutenção. Recebe { fotoAntes, fotoDepois, ...dados }:
// sobe as fotos presentes antes do insert; se o banco falhar depois do
// upload, remove as fotos recém-enviadas (best-effort) para não deixar
// órfãs. No sucesso, invalida APENAS a chave do equipamento da manutenção.
export function useCriarManutencao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ fotoAntes, fotoDepois, ...dados }) => {
      const enviadas = []

      // Uploads E insert no mesmo try: se a 2ª foto (ou o insert) falhar, o
      // catch remove qualquer foto JÁ enviada — senão a 1ª ficaria órfã no
      // bucket, sem nenhuma linha apontando para ela.
      try {
        let foto_antes_url = null
        let foto_depois_url = null

        if (fotoAntes) {
          foto_antes_url = await enviarFoto(fotoAntes)
          enviadas.push(foto_antes_url)
        }
        if (fotoDepois) {
          foto_depois_url = await enviarFoto(fotoDepois)
          enviadas.push(foto_depois_url)
        }

        return await criarManutencao({
          ...dados,
          foto_antes_url,
          foto_depois_url,
        })
      } catch (e) {
        for (const url of enviadas) {
          await removerFotoPorUrl(url).catch(() => {})
        }
        throw e
      }
    },
    onSuccess: () => {
      // Invalida toda a família ['manutencoes', ...] — cobre o histórico
      // do equipamento E o ['manutencoes', 'todas'] do dashboard.
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] })
    },
  })
}
