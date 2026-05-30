import { supabase } from '../../core/supabase'

// Lista o histórico de manutenções de UM equipamento, mais recente
// primeiro (ordenado por data).
export async function buscarManutencoes(equipamentoId) {
  const { data, error } = await supabase
    .from('manutencoes')
    .select('*')
    .eq('equipamento_id', equipamentoId)
    .order('data', { ascending: false })

  if (error) throw error
  return data
}

// Registra uma manutenção. Retorna a linha criada (com equipamento_id),
// usada para invalidar o cache do equipamento certo.
export async function criarManutencao(manutencao) {
  const { data, error } = await supabase
    .from('manutencoes')
    .insert(manutencao)
    .select()
    .single()

  if (error) throw error
  return data
}
