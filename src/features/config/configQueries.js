import { supabase } from '../../core/supabase'

// Configuração única do PMOC (id = 1). Escrita restrita a admin pelo RLS.

export async function buscarConfigPmoc() {
  const { data, error } = await supabase
    .from('config_pmoc')
    .select('*')
    .eq('id', 1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function salvarConfigPmoc(dados) {
  const { data, error } = await supabase
    .from('config_pmoc')
    .update(dados)
    .eq('id', 1)
    .select()
    .single()
  if (error) throw error
  return data
}
