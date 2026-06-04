// Traduz o erro do Supabase Auth para uma mensagem em português. Função pura
// (recebe o erro, devolve string) — o usuário opera em PT e não deve ver as
// strings cruas em inglês ("Invalid login credentials" etc.). Nunca vaza o
// texto original: casos desconhecidos caem no fallback genérico.
export function mensagemErroAuth(error) {
  // Falha de rede: o fetch nem chegou ao servidor (sem status HTTP).
  // O signInWithPassword lança TypeError "Failed to fetch" nesse caso.
  if (error?.status == null && /fetch|network/i.test(error?.message ?? '')) {
    return 'Sem conexão. Verifique sua internet e tente de novo.'
  }

  const codigo = error?.code
  const msg = error?.message ?? ''

  // Muitas tentativas (rate limit do Supabase).
  if (error?.status === 429 || /rate limit/i.test(msg)) {
    return 'Muitas tentativas. Aguarde um momento e tente de novo.'
  }

  // Credenciais erradas (e-mail ou senha).
  if (
    codigo === 'invalid_credentials' ||
    /invalid login credentials/i.test(msg)
  ) {
    return 'E-mail ou senha incorretos.'
  }

  // Qualquer outro caso: mensagem genérica, sem vazar o texto em inglês.
  return 'Não foi possível entrar. Tente novamente.'
}
