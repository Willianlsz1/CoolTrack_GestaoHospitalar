// Helpers de data em fuso LOCAL, formato YYYY-MM-DD. Usar toISOString()
// seria UTC e adiantaria o dia à noite no Brasil (UTC-3) — por isso
// toLocaleDateString('en-CA'), que dá o formato certo no fuso local.

export function hojeLocal() {
  return new Date().toLocaleDateString('en-CA')
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
// Use SÓ para colunas de DATA pura (YYYY-MM-DD), como `data`. Para timestamps
// com hora/fuso (campos *_em), use formatarDataLocal — fatiar um timestamp UTC
// aqui adiantaria o dia à noite no Brasil (UTC-3).
export function formatarData(dataStr) {
  if (!dataStr) return '—'
  const [ano, mes, dia] = dataStr.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

// Timestamp ISO com hora/fuso (ex.: aprovado_em, decidido_em) -> 'DD/MM/AAAA'
// no fuso LOCAL. Converte antes de exibir, então uma decisão tomada à noite
// não "pula" para o dia seguinte (como aconteceria fatiando a porção UTC).
export function formatarDataLocal(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('pt-BR')
}

// 'YYYY-MM-DD' + n dias -> 'YYYY-MM-DD' (fuso local). Usado para calcular
// a "próxima manutenção" = última + intervalo.
export function somarDias(dataStr, n) {
  if (!dataStr) return null
  const d = new Date(`${dataStr.slice(0, 10)}T00:00:00`)
  d.setDate(d.getDate() + n)
  return d.toLocaleDateString('en-CA')
}

// 'N dia' / 'N dias' — pluralização da contagem de dias, usada nos rótulos de
// cadência (ronda, dashboard, ficha).
export function pluralDias(n) {
  return `${n} ${n === 1 ? 'dia' : 'dias'}`
}
