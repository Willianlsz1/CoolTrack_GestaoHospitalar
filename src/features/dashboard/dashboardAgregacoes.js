// Funções puras de agregação do dashboard. Recebem os dados já buscados
// (equipamentos e manutenções) e devolvem os números/listas dos widgets.
// Datas são comparadas como texto 'YYYY-MM-DD' (ordenável sem fuso).
import { hojeLocal } from '../../core/data'
import {
  nomeSetorDoEquipamento,
  classificarChecklistMensal,
} from '../../core/dominio'

// Status do checklist de um equipamento pela regra canônica (mesma da
// ronda/setores/ficha) — garante que "atrasado" bata em todas as telas.
function statusChecklist(eq, ultimaPrev, hoje) {
  return classificarChecklistMensal(
    eq,
    ultimaPrev.get(eq.id)?.data ?? null,
    hoje,
  )
}

// Conta equipamentos por status (ordem fixa).
export function contarPorStatus(equipamentos) {
  const contagem = { ativo: 0, manutencao: 0, inativo: 0 }
  for (const eq of equipamentos) {
    if (contagem[eq.status] !== undefined) {
      contagem[eq.status] += 1
    }
  }
  return contagem
}

// Percentual formatado em pt-BR (vírgula decimal, 1 casa).
export function percentual(parte, total) {
  if (!total) return '0%'
  return `${((parte / total) * 100).toFixed(1).replace('.', ',')}%`
}

// Atrasados (chave 'atrasado' da regra canônica): passou do intervalo desde
// a base (última preventiva ou, na falta, a instalação). Equipamento novo sem
// checklist NÃO entra aqui enquanto está na carência (cai em "nunca"). Mostra
// os DIAS DE ATRASO; mais atrasado primeiro.
export function atrasadosComDias(equipamentos, ultimaPrev) {
  const hoje = hojeLocal()
  return equipamentos
    .map((eq) => {
      // Só ativos contam como atrasados (igual à ronda); em manutenção/inativo
      // não são inspecionados.
      if (eq.status !== 'ativo') return null
      const c = statusChecklist(eq, ultimaPrev, hoje)
      if (c.chave !== 'atrasado') return null
      return { eq, dias: c.dias, nuncaPreventiva: !ultimaPrev.has(eq.id) }
    })
    .filter(Boolean)
    .sort((a, b) => b.dias - a.dias)
}

// Vence em breve (chave 'vence'): higienização a vencer dentro da janela,
// ainda não vencida. Mais perto de vencer primeiro.
export function venceEmBreve(equipamentos, ultimaPrev) {
  const hoje = hojeLocal()
  return equipamentos
    .map((eq) => {
      if (eq.status !== 'ativo') return null
      const c = statusChecklist(eq, ultimaPrev, hoje)
      return c.chave === 'vence' ? { eq, dias: c.dias } : null
    })
    .filter(Boolean)
    .sort((a, b) => a.dias - b.dias)
}

// Serviços reprovados registrados por um usuário (o técnico), do mais recente
// para o mais antigo. Fecha o ciclo "gestor reprova -> técnico corrige": o
// técnico vê no dashboard o que precisa refazer e o motivo.
export function reprovadosDoUsuario(manutencoes, usuarioId) {
  if (!usuarioId) return []
  return manutencoes
    .filter(
      (m) =>
        m.aprovacao_status === 'reprovado' && m.registrado_por === usuarioId,
    )
    .sort((a, b) => (b.aprovado_em ?? '').localeCompare(a.aprovado_em ?? ''))
}

// As N manutenções mais recentes (já ordenadas por data desc).
export function ultimasManutencoes(manutencoes, n = 5) {
  return manutencoes.slice(0, n)
}

// Distribuição por setor ORDENADA (maior primeiro), com os menores
// agrupados em "Outros setores" acima do limite.
export function porSetorOrdenado(equipamentos, limite = 8) {
  const mapa = {}
  for (const eq of equipamentos) {
    const setor = nomeSetorDoEquipamento(eq) ?? 'Sem setor'
    mapa[setor] = (mapa[setor] || 0) + 1
  }

  const ordenado = Object.entries(mapa)
    .map(([setor, count]) => ({ setor, count }))
    .sort((a, b) => b.count - a.count)

  const principais = ordenado.slice(0, limite)
  const outros = ordenado.slice(limite).reduce((s, x) => s + x.count, 0)
  if (outros > 0) {
    principais.push({ setor: 'Outros setores', count: outros, agrupado: true })
  }
  return principais
}
