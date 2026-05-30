import { useContext } from 'react'
import { SessaoContext } from './sessaoContext'

// Hook para ler a sessão em qualquer componente: { sessao, carregando }.
export function useSessao() {
  return useContext(SessaoContext)
}
