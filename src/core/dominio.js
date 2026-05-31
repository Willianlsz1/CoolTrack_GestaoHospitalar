// Helpers de domínio compartilhados entre features (puros, sem I/O).
import { diasEntre } from './data'

// Janela (dias) do "vence em breve".
const JANELA_VENCE = 7

// Classifica o status do checklist MENSAL de um equipamento vs a cadência.
// `ultima` = data 'YYYY-MM-DD' da última preventiva (ou null); `hoje` idem.
// Retorna { chave, cor, ordem, pendente, dias } — cada tela formata o texto.
// Fonte única usada pela ficha (aba Checklist) e pela ronda.
export function classificarChecklistMensal(eq, ultima, hoje) {
  if (!eq.intervalo_mensal) {
    return {
      chave: 'sem_cadencia',
      cor: 'var(--fg-3)',
      ordem: 4,
      pendente: false,
      dias: 0,
    }
  }
  if (!ultima) {
    return {
      chave: 'nunca',
      cor: 'var(--warn)',
      ordem: 1,
      pendente: true,
      dias: 0,
    }
  }
  const restam = eq.intervalo_mensal - diasEntre(ultima, hoje)
  if (restam < 0) {
    return {
      chave: 'atrasado',
      cor: 'var(--danger)',
      ordem: 0,
      pendente: true,
      dias: -restam,
    }
  }
  if (restam <= JANELA_VENCE) {
    return {
      chave: 'vence',
      cor: 'var(--warn)',
      ordem: 2,
      pendente: true,
      dias: restam,
    }
  }
  return {
    chave: 'emdia',
    cor: 'var(--ok)',
    ordem: 3,
    pendente: false,
    dias: restam,
  }
}

// Nome do setor de um equipamento: prefere o setor relacionado (setor_id),
// caindo no texto legado (`setor`) para registros ainda não migrados.
export function nomeSetorDoEquipamento(eq) {
  return eq.setores?.nome ?? eq.setor ?? null
}

// Mapa equipamento_id -> última manutenção PREVENTIVA (o que zera o relógio
// do PMOC; corretiva/preditiva não contam). Espera as manutenções já
// ordenadas por data desc, então a 1ª preventiva de cada id é a mais recente.
export function ultimaPreventivaPorEquipamento(manutencoes) {
  const mapa = new Map()
  for (const m of manutencoes) {
    if (m.tipo !== 'preventiva') continue
    // Serviço REPROVADO pelo gestor não vale como preventiva: o trabalho foi
    // considerado inadequado, então não zera o relógio do PMOC. Pendente e
    // aprovado contam (a aprovação não atrasa a cadência).
    if (m.aprovacao_status === 'reprovado') continue
    if (!mapa.has(m.equipamento_id)) mapa.set(m.equipamento_id, m)
  }
  return mapa
}
