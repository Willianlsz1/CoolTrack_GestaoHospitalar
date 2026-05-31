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
