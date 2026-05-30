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

// Ordena UMA vez, calcula o intervalo médio (dias) entre manutenções
// consecutivas e projeta a próxima. Retorna { intervalo, proxima };
// ambos null quando há menos de 2 manutenções. Não muta a lista.
export function preverManutencao(manutencoes) {
  if (manutencoes.length < 2) {
    return { intervalo: null, proxima: null }
  }

  const datas = manutencoes
    .map((m) => m.data)
    .slice()
    .sort()

  let soma = 0
  for (let i = 1; i < datas.length; i++) {
    soma += diasDesdeEpoca(datas[i]) - diasDesdeEpoca(datas[i - 1])
  }
  const intervalo = Math.round(soma / (datas.length - 1))

  const ultima = datas[datas.length - 1]
  const ms = new Date(ultima).getTime() + intervalo * MS_DIA
  const proxima = new Date(ms).toISOString().slice(0, 10)

  return { intervalo, proxima }
}
