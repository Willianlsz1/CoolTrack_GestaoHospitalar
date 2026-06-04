import { supabase } from '../../core/supabase'

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

  if (error) throw error
}
