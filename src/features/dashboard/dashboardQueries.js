import { supabase } from '../../core/supabase'

// Todas as manutenções com o NOME do equipamento via relacionamento
// (equipamentos(nome)), mais recentes primeiro. É a base das agregações
// do dashboard (últimas manutenções, atrasadas, etc.).
// 2 FKs para perfis: hint registrado_por = técnico (key `perfis`),
// aprovador:perfis!aprovado_por = o gestor que aprovou (a "assinatura").
export async function buscarTodasManutencoes() {
  const { data, error } = await supabase
    .from('manutencoes')
    .select(
      '*, equipamentos(nome, tipo, setores(nome)), perfis!registrado_por(nome), aprovador:perfis!aprovado_por(nome)',
    )
    .order('data', { ascending: false })
    .order('created_at', { ascending: false }) // desempate determinístico

  if (error) throw error
  return data
}
