import { useMutation, useQueryClient } from '@tanstack/react-query'
import { decidirAprovacao } from './aprovacaoQueries'

// Mutação aprovar/reprovar. Invalida ['manutencoes'] (prefixo) para a fila
// e o histórico do equipamento refletirem a decisão.
export function useAprovarManutencao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, motivo }) =>
      decidirAprovacao(id, { status, motivo }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['manutencoes'] }),
  })
}
