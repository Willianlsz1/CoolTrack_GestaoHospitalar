import { supabase } from '../../core/supabase'
import { mensagemErroAuth } from './authMensagens'

// Envolvem o supabase.auth. Lançam o erro para a tela tratar a mensagem.

export async function entrar(email, senha) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  })
  // Traduz aqui (na borda) para o usuário ver PT, não a string crua do Supabase.
  if (error) throw new Error(mensagemErroAuth(error))
}

export async function sair() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
