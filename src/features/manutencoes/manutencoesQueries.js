import { supabase } from '../../core/supabase'

// Lista o histórico de manutenções de UM equipamento, mais recente
// primeiro (ordenado por data).
export async function buscarManutencoes(equipamentoId) {
  // 2 FKs para perfis: registrado_por = técnico (key `perfis`);
  // aprovador:perfis!aprovado_por = quem aprovou (assinatura na ficha).
  const { data, error } = await supabase
    .from('manutencoes')
    .select(
      '*, perfis!registrado_por(nome), aprovador:perfis!aprovado_por(nome)',
    )
    .eq('equipamento_id', equipamentoId)
    .order('data', { ascending: false })
    .order('created_at', { ascending: false }) // desempate determinístico

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

// URLs de fotos (antes/depois) das manutenções de um equipamento —
// usadas para apagar os arquivos do Storage na exclusão em cascata.
export async function buscarUrlsFotosManutencoes(equipamentoId) {
  const { data, error } = await supabase
    .from('manutencoes')
    .select('foto_antes_url, foto_depois_url')
    .eq('equipamento_id', equipamentoId)

  if (error) throw error
  return data
    .flatMap((m) => [m.foto_antes_url, m.foto_depois_url])
    .filter(Boolean)
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
