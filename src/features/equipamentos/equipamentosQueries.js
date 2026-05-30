import { supabase } from '../../core/supabase'

export async function buscarEquipamentos() {
  const { data, error } = await supabase
    .from('equipamentos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function criarEquipamento(equipamento) {
  const { data, error } = await supabase
    .from('equipamentos')
    .insert(equipamento)
    .select()
    .single()

  if (error) throw error
  return data
}