import { supabase } from '../../core/supabase'

// Usuário logado (ou erro). Centraliza o boilerplate de sessão que as
// mutations de aprovação repetiam.
async function usuarioAtual() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Sem sessão.')
  return user
}

// Trilha de decisões de um serviço (aprovacoes_log, migração 0026). A própria
// RLS da tabela só devolve linhas para admin (técnico recebe []), então a
// consulta é direta. Embute o nome de quem decidiu (FK única decidido_por).
export async function buscarAprovacoesLog(manutencaoId) {
  const { data, error } = await supabase
    .from('aprovacoes_log')
    .select('id, status, motivo, decidido_em, decididor:perfis(nome)')
    .eq('manutencao_id', manutencaoId)
    .order('decidido_em', { ascending: true })
  if (error) throw error
  return data
}

// Aprova ou reprova um serviço (manutenção). Só admin consegue (RLS da
// migração 0023). Grava quem decidiu, quando, e o motivo (que só faz
// sentido na reprovação — na aprovação volta a null). Retorna quantas linhas
// foram de fato decididas: 0 se o serviço já tinha sido decidido por outra
// sessão (a UI distingue isso de um sucesso real).
export async function decidirAprovacao(id, { status, motivo }) {
  const user = await usuarioAtual()

  const { data, error } = await supabase
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
    .select('id')

  if (error) throw error
  return data.length
}

// Reabre um serviço já decidido: volta para 'pendente' (limpa motivo e data).
// O gestor então decide de novo pelo fluxo normal. aprovado_por recebe o id
// de quem reabriu — exigido pela policy (WITH CHECK aprovado_por = auth.uid())
// e usado pela trilha (0026) para registrar QUEM reabriu.
export async function reabrirDecisao(id) {
  const user = await usuarioAtual()

  const { error } = await supabase
    .from('manutencoes')
    .update({
      aprovacao_status: 'pendente',
      aprovacao_motivo: null,
      aprovado_por: user.id,
      aprovado_em: null,
    })
    .eq('id', id)
    // Só reabre o que JÁ foi decidido — simétrico aos irmãos e idempotente:
    // reabrir um já-pendente seria um no-op que ainda assim mexeria em
    // aprovado_por e gravaria um evento falso na trilha de auditoria.
    .neq('aprovacao_status', 'pendente')

  if (error) throw error
}

// Aprova VÁRIOS serviços de uma vez (um único update .in). Só admin (RLS).
// Reprovação não tem versão em lote — exige motivo por serviço. Retorna
// quantos foram de fato aprovados (pode ser menos que o pedido se algum já
// tiver sido decidido por outra sessão).
export async function aprovarVarios(ids) {
  const user = await usuarioAtual()

  const { data, error } = await supabase
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
    .select('id')

  if (error) throw error
  return data.length
}
