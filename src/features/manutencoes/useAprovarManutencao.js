import { useMutation, useQueryClient } from '@tanstack/react-query'
import { decidirAprovacao, aprovarVarios } from './aprovacaoQueries'

// Mutação aprovar/reprovar (um serviço). Invalida ['manutencoes'] (prefixo)
// para a fila e o histórico do equipamento refletirem a decisão.
export function useAprovarManutencao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, motivo }) =>
      decidirAprovacao(id, { status, motivo }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['manutencoes'] }),
  })
}

// Aprovação em LOTE (vários ids de uma vez).
export function useAprovarVarios() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids) => aprovarVarios(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['manutencoes'] }),
  })
}
