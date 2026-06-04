import { supabase } from '../../core/supabase'

// Trilha de decisões de um serviço (aprovacoes_log, migração 0026). A própria
// RLS da tabela só devolve linhas para admin (técnico recebe []), então a
// consulta é direta. Embute o nome de quem decidiu (FK única decidido_por).
export async function buscarAprovacoesLog(manutencaoId) {
  const { data, error } = await supabase
    .from('aprovacoes_log')
    .select(
      'id, status_anterior, status, motivo, decidido_em, decididor:perfis(nome)',
    )
    .eq('manutencao_id', manutencaoId)
    .order('decidido_em', { ascending: true })
  if (error) throw error
  return data
}

// Aprova ou reprova um serviço (manutenção). Só admin consegue (RLS da
// migração 0023). Grava quem decidiu, quando, e o motivo (que só faz
// sentido na reprovação — na aprovação volta a null).
export async function decidirAprovacao(id, { status, motivo }) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Sem sessão.')

  const { error } = await supabase
    .from('manutencoes')
    .update({
      aprovacao_status: status,
      aprovacao_motivo: status === 'reprovado' ? motivo : null,
      aprovado_por: user.id,
      aprovado_em: new Date().toISOString(),
    })
    .eq('id', id)
    // Só decide o que está pendente: a regra vive na fronteira de dados, não
    // só na seleção da UI. Evita re-carimbar uma decisão já tomada.
    .eq('aprovacao_status', 'pendente')

  if (error) throw error
}

// Reabre um serviço já decidido: volta para 'pendente' (limpa motivo e data).
// O gestor então decide de novo pelo fluxo normal. aprovado_por recebe o id
// de quem reabriu — exigido pela policy (WITH CHECK aprovado_por = auth.uid())
// e usado pela trilha (0026) para registrar QUEM reabriu.
export async function reabrirDecisao(id) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Sem sessão.')

  const { error } = await supabase
    .from('manutencoes')
    .update({
      aprovacao_status: 'pendente',
      aprovacao_motivo: null,
      aprovado_por: user.id,
      aprovado_em: null,
    })
    .eq('id', id)

  if (error) throw error
}

// Aprova VÁRIOS serviços de uma vez (um único update .in). Só admin (RLS).
// Reprovação não tem versão em lote — exige motivo por serviço.
export async function aprovarVarios(ids) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Sem sessão.')

  const { error } = await supabase
    .from('manutencoes')
    .update({
      aprovacao_status: 'aprovado',
      aprovacao_motivo: null,
      aprovado_por: user.id,
      aprovado_em: new Date().toISOString(),
    })
    .in('id', ids)
    // Só aprova o que está pendente (mesma defesa do decidirAprovacao): não
    // re-carimba serviços já decididos nem polui a trilha de auditoria.
    .eq('aprovacao_status', 'pendente')

  if (error) throw error
}
