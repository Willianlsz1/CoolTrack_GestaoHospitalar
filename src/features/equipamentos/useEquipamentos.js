import { useQuery } from '@tanstack/react-query'
import { buscarEquipamentos } from './equipamentosQueries'

// Hook fino: encapsula a query da lista de equipamentos com uma chave
// de cache única (['equipamentos']). Qualquer tela que precise da lista
// usa este hook; no passo 4, o cadastro invalida ESSA mesma chave para
// a lista se atualizar sozinha.
export function useEquipamentos() {
  return useQuery({
    queryKey: ['equipamentos'],
    queryFn: buscarEquipamentos,
  })
}
