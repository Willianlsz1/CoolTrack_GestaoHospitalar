import { supabase } from '../../core/supabase'

// Envolvem o supabase.auth. Lançam o erro para a tela tratar a mensagem.

export async function entrar(email, senha) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  })
  if (error) throw error
}

export async function sair() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
