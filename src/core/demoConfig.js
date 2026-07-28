// Modo visitante: o app inteiro apontado para um projeto Supabase SEPARADO,
// só com dados fictícios (seed SEED-%). Isolamento é a regra de segurança
// número um aqui: o visitante nunca autentica no banco real do hospital —
// outro projeto, outra URL, outras credenciais. Um usuário demo no banco de
// produção veria os dados reais, porque o RLS libera leitura para qualquer
// autenticado (modelo single-tenant).
//
// Estas constantes são públicas por design: a URL e a publishable key do
// Supabase aparecem em qualquer request do navegador, e a conta visitante
// existe para ser usada por estranhos. Nada aqui é segredo.

export const DEMO_URL = 'https://vtomevtemxkfvuyfiqsw.supabase.co'
export const DEMO_KEY = 'sb_publishable_KFbe7G-4RmrX-fWbRo9Rqw_aGxcdIuL'
export const DEMO_EMAIL = 'visitante@cooltrack.demo'
export const DEMO_SENHA = 'visitante-cooltrack-2026'

const CHAVE = 'ct-modo-demo'

export function modoDemoAtivo() {
  try {
    return localStorage.getItem(CHAVE) === '1'
  } catch {
    return false
  }
}

// A troca de projeto exige recarregar a página: o cliente Supabase é criado
// uma única vez no boot (core/supabase.js) com a URL escolhida.
export function entrarModoDemo() {
  localStorage.setItem(CHAVE, '1')
  location.reload()
}

export function sairModoDemo() {
  localStorage.removeItem(CHAVE)
  location.reload()
}
