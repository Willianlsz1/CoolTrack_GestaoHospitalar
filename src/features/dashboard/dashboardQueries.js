import { supabase } from '../../core/supabase'

// Todas as manutenções com o NOME do equipamento via relacionamento
// (equipamentos(nome)), mais recentes primeiro. É a base das agregações
// do dashboard (últimas manutenções, atrasadas, etc.).
export async function buscarTodasManutencoes() {
  const { data, error } = await supabase
    .from('manutencoes')
    .select('*, equipamentos(nome, tipo, setores(nome)), perfis(nome)')
    .order('data', { ascending: false })
    .order('created_at', { ascending: false }) // desempate determinístico

  if (error) throw error
  return data
}
