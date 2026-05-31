import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { buscarConfigPmoc, salvarConfigPmoc } from './configQueries'

export function useConfigPmoc() {
  return useQuery({ queryKey: ['config_pmoc'], queryFn: buscarConfigPmoc })
}

export function useSalvarConfigPmoc() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: salvarConfigPmoc,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['config_pmoc'] }),
  })
}
