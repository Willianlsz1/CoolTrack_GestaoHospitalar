import { somarDias, formatarData } from '../../core/data'

// 1 TR (tonelada de refrigeração) = 12.000 BTU/h.
const BTU_POR_TR = 12000

// Última preventiva por equipamento (manutenções vêm ordenadas desc).
function ultimaPreventiva(manutencoes) {
  const mapa = new Map()
  for (const m of manutencoes) {
    if (m.tipo !== 'preventiva') continue
    if (!mapa.has(m.equipamento_id)) mapa.set(m.equipamento_id, m)
  }
  return mapa
}

// Monta as linhas + totais do relatório PMOC a partir dos dados já buscados.
// Espelha as colunas do documento oficial (periodicidade, última/próxima,
// localização, carga, área, ativo) e os totais (qtd, BTU, m², TR).
export function montarRelatorioPmoc(equipamentos, manutencoes) {
  const ultimaPrev = ultimaPreventiva(manutencoes)

  const linhas = equipamentos.map((eq) => {
    const m = ultimaPrev.get(eq.id)
    const ultima = m?.data ?? null
    const proxima =
      ultima && eq.intervalo_mensal
        ? somarDias(ultima, eq.intervalo_mensal)
        : null
    const periodicidade =
      eq.intervalo_mensal || eq.intervalo_anual
        ? `${eq.intervalo_mensal ?? '—'} / ${eq.intervalo_anual ?? '—'}`
        : '—'

    return {
      id: eq.id,
      nome: eq.nome,
      periodicidade,
      ultima: formatarData(ultima),
      proxima: formatarData(proxima),
      setor: eq.setores?.nome ?? eq.setor ?? '—',
      cargaBtu: eq.carga_btu ?? null,
      areaM2: eq.area_m2 ?? null,
      ativo: eq.status === 'ativo' ? 'S' : 'N',
    }
  })

  const btu = linhas.reduce((s, l) => s + (l.cargaBtu ?? 0), 0)
  const m2 = linhas.reduce((s, l) => s + (l.areaM2 ?? 0), 0)
  const totais = {
    quantidade: linhas.length,
    btu,
    m2,
    tr: btu / BTU_POR_TR,
  }

  return { linhas, totais }
}
