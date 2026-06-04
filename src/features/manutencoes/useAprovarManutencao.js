import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  decidirAprovacao,
  aprovarVarios,
  reabrirDecisao,
} from './aprovacaoQueries'

// Invalida o que uma decisão de aprovação afeta: ['manutencoes'] (fila +
// histórico do equipamento) E ['aprovacoes_log'] (a trilha de decisões, que
// ganha uma linha nova a cada decisão/reabertura).
function invalidarAprovacao(qc) {
  qc.invalidateQueries({ queryKey: ['manutencoes'] })
  qc.invalidateQueries({ queryKey: ['aprovacoes_log'] })
}

// Mutação aprovar/reprovar (um serviço). Devolve quantas linhas foram de fato
// decididas (0 = já decidido por outra sessão).
export function useAprovarManutencao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, motivo }) =>
      decidirAprovacao(id, { status, motivo }),
    onSuccess: () => invalidarAprovacao(qc),
  })
}

// Aprovação em LOTE (vários ids de uma vez). Devolve quantos foram aprovados.
export function useAprovarVarios() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids) => aprovarVarios(ids),
    onSuccess: () => invalidarAprovacao(qc),
  })
}

// Reabre um serviço decidido (volta para 'pendente').
export function useReabrirManutencao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => reabrirDecisao(id),
    onSuccess: () => invalidarAprovacao(qc),
  })
}
