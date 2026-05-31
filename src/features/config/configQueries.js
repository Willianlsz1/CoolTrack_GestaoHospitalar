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
  // upsert na linha única (id=1): robusto mesmo se a linha não existir.
  const { data, error } = await supabase
    .from('config_pmoc')
    .upsert({ id: 1, ...dados }, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw error
  return data
}
