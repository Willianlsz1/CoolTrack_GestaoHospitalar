import { supabase } from '../../core/supabase'

// Chama a Edge Function 'redefinir-senha'. O supabase-js anexa o JWT do
// usuário logado (Authorization) automaticamente — a função usa esse token
// para confirmar que o chamador é admin antes de redefinir.
export async function redefinirSenha({ usuarioId, senha }) {
  const { data, error } = await supabase.functions.invoke('redefinir-senha', {
    body: { usuarioId, senha },
  })

  // Em erro HTTP (status != 2xx), o invoke devolve `error` e a mensagem real
  // fica no corpo da resposta (error.context é o Response). Extraímos dali.
  if (error) {
    let msg = 'Não foi possível redefinir a senha.'
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
