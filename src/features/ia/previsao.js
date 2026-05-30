// Previsão estatística (camada grátis da IA preditiva). Funções puras
// sobre o histórico de manutenções. Datas 'YYYY-MM-DD' tratadas em UTC
// (consistente, sem pegadinha de fuso) só para contar dias.

const MS_DIA = 86400000

// Número de dias da data (UTC) desde a época — para diferenças.
function diasDesdeEpoca(dataStr) {
  return new Date(dataStr).getTime() / MS_DIA
}

// Intervalo médio (em dias) entre manutenções consecutivas. Precisa de
// ao menos 2 manutenções; senão retorna null. Não muta a lista recebida.
export function intervaloMedioDias(manutencoes) {
  if (manutencoes.length < 2) return null

  const datas = manutencoes
    .map((m) => m.data)
    .slice()
    .sort()
  let soma = 0
  for (let i = 1; i < datas.length; i++) {
    soma += diasDesdeEpoca(datas[i]) - diasDesdeEpoca(datas[i - 1])
  }
  return Math.round(soma / (datas.length - 1))
}

// Próxima manutenção sugerida = última data + intervalo médio.
// Retorna 'YYYY-MM-DD' ou null se não há dados suficientes.
export function proximaSugerida(manutencoes) {
  const intervalo = intervaloMedioDias(manutencoes)
  if (intervalo === null) return null

  const datas = manutencoes
    .map((m) => m.data)
    .slice()
    .sort()
  const ultima = datas[datas.length - 1]
  const ms = new Date(ultima).getTime() + intervalo * MS_DIA
  return new Date(ms).toISOString().slice(0, 10)
}
