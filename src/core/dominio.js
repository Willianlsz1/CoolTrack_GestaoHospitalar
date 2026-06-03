// Helpers de domínio compartilhados entre features (puros, sem I/O).
import { diasEntre } from './data'

// Janela (dias) do "vence em breve".
const JANELA_VENCE = 7

// Classifica o status do checklist MENSAL de um equipamento vs a cadência.
// REGRA CANÔNICA — usada por ficha, ronda, setores E dashboard, para o
// "atrasado" significar a mesma coisa em todas as telas.
//
// `ultima` = data 'YYYY-MM-DD' da última preventiva válida (ou null); `hoje` idem.
// Base do relógio: a última preventiva ou, na falta dela, a data de INSTALAÇÃO
// (ou o cadastro). Assim um equipamento recém-instalado SEM checklist tem uma
// carência de um ciclo antes de "atrasar" — só vira atrasado ao passar o
// intervalo desde a instalação.
//
// Chaves: atrasado (passou do intervalo) · nunca (sem preventiva, ainda na
// carência) · vence (≤ JANELA_VENCE) · emdia · sem_cadencia.
// Retorna { chave, cor, ordem, pendente, dias }.
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

  const nunca = !ultima
  const base =
    ultima ?? eq.data_instalacao ?? eq.created_at?.slice(0, 10) ?? null

  // Nunca executado e sem data de instalação/cadastro: não dá para datar.
  if (!base) {
    return {
      chave: 'nunca',
      cor: 'var(--warn)',
      ordem: 1,
      pendente: true,
      dias: 0,
    }
  }

  const restam = eq.intervalo_mensal - diasEntre(base, hoje)

  if (restam < 0) {
    // Passou do intervalo desde a base — atrasado (com ou sem preventiva).
    return {
      chave: 'atrasado',
      cor: 'var(--danger)',
      ordem: 0,
      pendente: true,
      dias: -restam,
    }
  }
  if (nunca) {
    // Sem preventiva, mas ainda dentro do 1º ciclo desde a instalação:
    // pendente (precisa do 1º checklist), porém NÃO atrasado. `dias` = quanto
    // falta para o primeiro vencer.
    return {
      chave: 'nunca',
      cor: 'var(--warn)',
      ordem: 1,
      pendente: true,
      dias: restam,
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
export function ultimaPreventivaPorEquipamento(
  manutencoes,
  { somenteAprovadas = false } = {},
) {
  const mapa = new Map()
  for (const m of manutencoes) {
    if (m.tipo !== 'preventiva') continue
    // Serviço REPROVADO pelo gestor não vale como preventiva: o trabalho foi
    // considerado inadequado, então não zera o relógio do PMOC. Pendente e
    // aprovado contam (a aprovação não atrasa a cadência).
    if (m.aprovacao_status === 'reprovado') continue
    // somenteAprovadas: o RELATÓRIO oficial só certifica trabalho validado —
    // pendente não conta na coluna "Última".
    if (somenteAprovadas && m.aprovacao_status !== 'aprovado') continue
    if (!mapa.has(m.equipamento_id)) mapa.set(m.equipamento_id, m)
  }
  return mapa
}
