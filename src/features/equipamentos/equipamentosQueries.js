import { supabase } from '../../core/supabase'

export async function buscarEquipamentos() {
  const { data, error } = await supabase
    .from('equipamentos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function buscarEquipamentoPorId(id) {
  // maybeSingle: retorna null (sem erro) quando não encontra, em vez de
  // lançar como o single() faria. Assim "não existe" != "deu erro".
  const { data, error } = await supabase
    .from('equipamentos')
    .select('*')
    .eq('id', id)
    .maybeSingle()

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

export async function atualizarEquipamento(id, dados) {
  const { data, error } = await supabase
    .from('equipamentos')
    .update(dados)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function excluirEquipamento(id) {
  const { error } = await supabase.from('equipamentos').delete().eq('id', id)

  if (error) throw error
}

// Exclusão em cascata atômica (manutenções + equipamento numa única
// transação), via a função do banco (migração 0011).
export async function excluirEquipamentoEmCascata(id) {
  const { error } = await supabase.rpc('excluir_equipamento_em_cascata', {
    eq_id: id,
  })

  if (error) throw error
}
