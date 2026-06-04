// Previsão estatística (camada grátis da IA preditiva). Função pura
// sobre o histórico de manutenções.
//
// Importante: aqui só medimos DIFERENÇAS entre datas (intervalo entre
// manutenções), então tratamos as datas em UTC — o fuso se cancela na
// subtração e evita pegadinhas de horário. Para datas ABSOLUTAS ("hoje"),
// use src/core/data.js (que respeita o fuso local).

const MS_DIA = 86400000

function diasDesdeEpoca(dataStr) {
  return new Date(dataStr).getTime() / MS_DIA
}

// Ordena UMA vez, calcula o intervalo médio (dias) entre manutenções e
// projeta a próxima. Retorna { intervalo, proxima }; ambos null quando há
// menos de 2 manutenções OU quando o intervalo médio dá 0 (datas iguais).
// Não muta a lista. Só a MÉDIA importa aqui — a variância é ignorada de
// propósito; por isso o intervalo médio = (última - primeira) / (n - 1)
// (a soma das diferenças consecutivas é telescópica e colapsa nisso).
export function preverManutencao(manutencoes) {
  if (manutencoes.length < 2) {
    return { intervalo: null, proxima: null }
  }

  const datas = manutencoes
    .map((m) => m.data)
    .slice()
    .sort()

  const span =
    diasDesdeEpoca(datas[datas.length - 1]) - diasDesdeEpoca(datas[0])
  const intervalo = Math.round(span / (datas.length - 1))
  if (intervalo === 0) {
    return { intervalo: null, proxima: null }
  }

  const ultima = datas[datas.length - 1]
  const ms = new Date(ultima).getTime() + intervalo * MS_DIA
  const proxima = new Date(ms).toISOString().slice(0, 10)

  return { intervalo, proxima }
}
