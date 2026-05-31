// Helpers de domínio compartilhados entre features (puros, sem I/O).

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
    if (!mapa.has(m.equipamento_id)) mapa.set(m.equipamento_id, m)
  }
  return mapa
}
