// Seletores puros da fila de aprovação. Tratam status ausente como
// 'pendente' (defensivo, caso algum registro venha sem o campo).

function statusDe(m) {
  return m.aprovacao_status ?? 'pendente'
}

// Serviços de um status (pendente/aprovado/reprovado), na ordem recebida.
export function filtrarPorAprovacao(manutencoes, status) {
  return manutencoes.filter((m) => statusDe(m) === status)
}

// Contagem por status — alimenta os números das abas.
export function contagemPorAprovacao(manutencoes) {
  const c = { pendente: 0, aprovado: 0, reprovado: 0 }
  for (const m of manutencoes) {
    const s = statusDe(m)
    if (c[s] !== undefined) c[s] += 1
  }
  return c
}
