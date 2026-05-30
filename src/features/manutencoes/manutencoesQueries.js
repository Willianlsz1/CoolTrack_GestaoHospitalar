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

// Quantas manutenções um equipamento tem (head:true não traz as linhas,
// só o total) — usado para o aviso de exclusão em cascata.
export async function contarManutencoes(equipamentoId) {
  const { count, error } = await supabase
    .from('manutencoes')
    .select('*', { count: 'exact', head: true })
    .eq('equipamento_id', equipamentoId)

  if (error) throw error
  return count ?? 0
}
