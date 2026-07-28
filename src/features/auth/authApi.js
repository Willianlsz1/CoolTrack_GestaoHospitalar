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
  // Sair de dentro do modo visitante encerra o modo junto: sem isto, o
  // reload seguinte cairia de novo no auto-login do visitante e a pessoa
  // nunca voltaria à tela de login normal.
  const { modoDemoAtivo, sairModoDemo } = await import('../../core/demoConfig')
  if (modoDemoAtivo()) sairModoDemo()
}

// Define uma senha nova para o usuário LOGADO. Vale tanto para a troca
// obrigatória do primeiro acesso quanto para a troca voluntária no perfil.
// Não pede a senha atual: quem chega aqui já tem sessão válida, e exigi-la
// não bloquearia nada que a sessão aberta não permita fazer de qualquer jeito.
export async function trocarSenha(novaSenha) {
  const { error } = await supabase.auth.updateUser({ password: novaSenha })
  if (error) throw new Error(mensagemErroAuth(error))
}
