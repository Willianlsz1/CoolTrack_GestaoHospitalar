import { supabase } from '../../core/supabase'

// Lista todos os usuários (perfis) — usado para escolher o responsável de
// um setor. Todo autenticado pode ler perfis (RLS da 0014).
export async function buscarPerfis() {
  const { data, error } = await supabase
    .from('perfis')
    .select('id, nome, email')
    .order('nome')
  if (error) throw error
  return data
}

// Perfil do usuário logado (lê pelo id do usuário atual).
export async function buscarMeuPerfil() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw error
  return data
}

// Atualiza o nome do próprio perfil. O RLS já garante que só dá para
// editar o seu (id = auth.uid()).
export async function atualizarMeuNome(nome) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Sem sessão.')

  const { error } = await supabase
    .from('perfis')
    .update({ nome })
    .eq('id', user.id)

  if (error) throw error
}
