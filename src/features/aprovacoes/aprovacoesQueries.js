import { supabase } from '../../core/supabase'

// Contagem LEVE de serviços pendentes de aprovação — alimenta o badge do
// menu e o aviso do dashboard. head:true não traz as linhas, só o total.
export async function contarPendentesAprovacao() {
  const { count, error } = await supabase
    .from('manutencoes')
    .select('*', { count: 'exact', head: true })
    .eq('aprovacao_status', 'pendente')
  if (error) throw error
  return count ?? 0
}
