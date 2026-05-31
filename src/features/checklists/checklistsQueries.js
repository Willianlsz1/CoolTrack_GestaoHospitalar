import { supabase } from '../../core/supabase'

// CRUD dos modelos de checklist. Escrita restrita a admin pelo RLS (0019).

export async function buscarModelos() {
  const { data, error } = await supabase
    .from('modelos_checklist')
    .select('*')
    .order('tipo')
    .order('frequencia')
  if (error) throw error
  return data
}

export async function criarModelo({ tipo, frequencia, itens }) {
  const { data, error } = await supabase
    .from('modelos_checklist')
    .insert({ tipo, frequencia, itens })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function atualizarModelo(id, { itens }) {
  // Tipo e frequência ficam travados na edição (chave única); só os itens
  // mudam.
  const { data, error } = await supabase
    .from('modelos_checklist')
    .update({ itens })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function excluirModelo(id) {
  const { error } = await supabase
    .from('modelos_checklist')
    .delete()
    .eq('id', id)
  if (error) throw error
}
