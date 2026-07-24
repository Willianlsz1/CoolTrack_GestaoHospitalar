import { supabase } from '../../core/supabase'

// Lista os usuários para o dropdown de responsável de setor. Só id e nome —
// é tudo que o autenticado pode ler da tabela (grant por coluna da 0025);
// email/role ficam fora de propósito (não vazam para não-admin).
export async function buscarPerfis() {
  const { data, error } = await supabase
    .from('perfis')
    .select('id, nome')
    .order('nome')
  if (error) throw error
  return data
}

// Lista completa (id, nome, email, role) para o painel de admin. Vai pela
// função listar_usuarios(), que recusa quem não for admin (checagem no banco).
export async function listarUsuarios() {
  const { data, error } = await supabase.rpc('listar_usuarios')
  if (error) throw error
  return data
}

// Perfil do usuário logado, completo (com role/email). Vai pela função
// meu_perfil(), que sempre devolve só a linha de auth.uid().
export async function buscarMeuPerfil() {
  const { data, error } = await supabase.rpc('meu_perfil')
  if (error) throw error
  return data
}

// Marca que o usuário definiu uma senha PRÓPRIA (0029). Enquanto a coluna é
// null, o app entende que a senha em uso ainda é a temporária que o admin
// digitou ao criar a conta, e exige a troca.
export async function marcarSenhaTrocada() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Sem sessão.')

  const { error } = await supabase
    .from('perfis')
    .update({ senha_trocada_em: new Date().toISOString() })
    .eq('id', user.id)

  if (error) throw error
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
