import { supabase } from '../../core/supabase'

// CRUD de setores. A escrita (criar/editar/excluir) é restrita a admin
// pelo RLS do banco (migração 0018) — aqui é só a chamada.

export async function buscarSetores() {
  const { data, error } = await supabase
    .from('setores')
    .select('*')
    .order('nome')
  if (error) throw error
  return data
}

export async function criarSetor({ nome, intervalo_dias }) {
  const { data, error } = await supabase
    .from('setores')
    .insert({ nome, intervalo_dias })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function atualizarSetor(id, { nome, intervalo_dias }) {
  const { data, error } = await supabase
    .from('setores')
    .update({ nome, intervalo_dias })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function excluirSetor(id) {
  const { error } = await supabase.from('setores').delete().eq('id', id)
  if (error) throw error
}
