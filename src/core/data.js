// Helpers de data em fuso LOCAL, formato YYYY-MM-DD. Usar toISOString()
// seria UTC e adiantaria o dia à noite no Brasil (UTC-3) — por isso
// toLocaleDateString('en-CA'), que dá o formato certo no fuso local.

export function hojeLocal() {
  return new Date().toLocaleDateString('en-CA')
}

export function diasAtras(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toLocaleDateString('en-CA')
}

const MS_DIA = 86400000

// Dias inteiros entre duas datas 'YYYY-MM-DD' (UTC só para contar dias).
export function diasEntre(de, ate) {
  return Math.round((new Date(ate).getTime() - new Date(de).getTime()) / MS_DIA)
}

// 'YYYY-MM-DD' -> 'DD/MM' (para datas curtas na UI).
export function formatarDiaMes(dataStr) {
  if (!dataStr) return '—'
  return `${dataStr.slice(8, 10)}/${dataStr.slice(5, 7)}`
}

// 'YYYY-MM-DD' -> 'DD/MM/AAAA' (formato brasileiro, data cheia na UI).
// O banco guarda em ISO (bom para ordenar/comparar); aqui só exibimos.
export function formatarData(dataStr) {
  if (!dataStr) return '—'
  const [ano, mes, dia] = dataStr.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

// 'YYYY-MM-DD' + n dias -> 'YYYY-MM-DD' (fuso local). Usado para calcular
// a "próxima manutenção" = última + intervalo.
export function somarDias(dataStr, n) {
  if (!dataStr) return null
  const d = new Date(`${dataStr.slice(0, 10)}T00:00:00`)
  d.setDate(d.getDate() + n)
  return d.toLocaleDateString('en-CA')
}
