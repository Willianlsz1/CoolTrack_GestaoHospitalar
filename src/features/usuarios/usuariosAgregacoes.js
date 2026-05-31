// Funções puras de agregação dos usuários. Cruzam perfis com os setores
// que cada um responde e os serviços (manutenções) que registrou.

// Serviços registrados por um usuário, mais recentes primeiro. Espera as
// manutenções já ordenadas por data desc (como o app entrega).
export function servicosDoUsuario(manutencoes, usuarioId) {
  return manutencoes.filter((m) => m.registrado_por === usuarioId)
}

// Resumo por usuário: setores que responde + total de serviços + data do
// último. Retorna um Map: usuario_id -> { setores, totalServicos, ultimoServico }.
export function resumoUsuarios(perfis, setores, manutencoes) {
  // Agrupa os serviços por quem registrou (uma passada). Como as manutenções
  // chegam em ordem desc, o 1º de cada grupo é o mais recente.
  const servicosPorUsuario = new Map()
  for (const m of manutencoes) {
    const arr = servicosPorUsuario.get(m.registrado_por) ?? []
    arr.push(m)
    servicosPorUsuario.set(m.registrado_por, arr)
  }

  const mapa = new Map()
  for (const p of perfis) {
    const servicos = servicosPorUsuario.get(p.id) ?? []
    mapa.set(p.id, {
      setores: setores
        .filter((s) => s.responsavel_id === p.id)
        .map((s) => s.nome),
      totalServicos: servicos.length,
      ultimoServico: servicos[0]?.data ?? null,
    })
  }
  return mapa
}
