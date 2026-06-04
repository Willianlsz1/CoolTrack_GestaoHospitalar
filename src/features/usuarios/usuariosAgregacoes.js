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
  // Conta os serviços e guarda só o mais recente por usuário (uma passada),
  // sem materializar a lista inteira. Manutenções chegam em ordem desc, então
  // o 1º visto de cada usuário é o mais recente.
  const porUsuario = new Map() // id -> { total, ultimo }
  for (const m of manutencoes) {
    const r = porUsuario.get(m.registrado_por) ?? { total: 0, ultimo: null }
    r.total += 1
    if (r.ultimo === null) r.ultimo = m.data
    porUsuario.set(m.registrado_por, r)
  }

  const mapa = new Map()
  for (const p of perfis) {
    const r = porUsuario.get(p.id) ?? { total: 0, ultimo: null }
    mapa.set(p.id, {
      setores: setores
        .filter((s) => s.responsavel_id === p.id)
        .map((s) => s.nome),
      totalServicos: r.total,
      ultimoServico: r.ultimo,
    })
  }
  return mapa
}
