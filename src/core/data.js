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
