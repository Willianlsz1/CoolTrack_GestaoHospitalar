import { createContext } from 'react'

// Context da sessão de autenticação. Fica em arquivo próprio (sem
// componente) para o Fast Refresh do Vite não reclamar.
// carregando = ainda buscando a sessão inicial; sessao = null quando
// deslogado, ou o objeto de sessão do Supabase quando logado.
export const SessaoContext = createContext({ sessao: null, carregando: true })
