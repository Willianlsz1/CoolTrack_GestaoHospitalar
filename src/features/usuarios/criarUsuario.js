import { supabase } from '../../core/supabase'

// Chama a Edge Function 'criar-usuario'. O supabase-js anexa o JWT do
// usuário logado (Authorization) automaticamente — a função usa esse token
// para confirmar que o chamador é admin antes de criar.
export async function criarUsuario({ nome, email, senha }) {
  const { data, error } = await supabase.functions.invoke('criar-usuario', {
    body: { nome, email, senha },
  })

  // Em erro HTTP (status != 2xx), o invoke devolve `error` e a mensagem real
  // fica no corpo da resposta (error.context é o Response). Extraímos dali.
  if (error) {
    let msg = 'Não foi possível criar o usuário.'
    try {
      const corpo = await error.context.json()
      if (corpo?.error) msg = corpo.error
    } catch {
      /* sem corpo JSON — mantém a mensagem padrão */
    }
    throw new Error(msg)
  }
  return data
}
