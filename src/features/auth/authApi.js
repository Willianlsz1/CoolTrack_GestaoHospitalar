import { supabase } from '../../core/supabase'

// Envolvem o supabase.auth. Lançam o erro para a tela tratar a mensagem.

export async function entrar(email, senha) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  })
  if (error) throw error
}

export async function criarConta(email, senha, nome) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    // Vai para raw_user_meta_data; o trigger handle_new_user usa para
    // preencher o nome do perfil.
    options: { data: { nome } },
  })
  if (error) throw error
  return data
}

export async function sair() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
