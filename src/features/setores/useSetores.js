import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  buscarSetores,
  criarSetor,
  atualizarSetor,
  excluirSetor,
} from './setoresQueries'

// Lista de setores (ordenada por nome).
export function useSetores() {
  return useQuery({ queryKey: ['setores'], queryFn: buscarSetores })
}

export function useCriarSetor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: criarSetor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['setores'] }),
  })
}

export function useAtualizarSetor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...dados }) => atualizarSetor(id, dados),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['setores'] }),
  })
}

export function useExcluirSetor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: excluirSetor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['setores'] }),
  })
}
