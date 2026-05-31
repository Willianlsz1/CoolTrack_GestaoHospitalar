import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  buscarModelos,
  criarModelo,
  atualizarModelo,
  excluirModelo,
} from './checklistsQueries'

export function useModelosChecklist() {
  return useQuery({ queryKey: ['modelos_checklist'], queryFn: buscarModelos })
}

export function useCriarModelo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: criarModelo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['modelos_checklist'] }),
  })
}

export function useAtualizarModelo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...dados }) => atualizarModelo(id, dados),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['modelos_checklist'] }),
  })
}

export function useExcluirModelo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: excluirModelo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['modelos_checklist'] }),
  })
}
