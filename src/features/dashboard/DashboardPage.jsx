import { Link } from '@tanstack/react-router'
import { useEquipamentos } from '../equipamentos/useEquipamentos'
import { useTodasManutencoes } from './useTodasManutencoes'
import {
  contarPorStatus,
  equipamentosAtrasados,
  equipamentosSemManutencao,
  ultimasManutencoes,
  distribuicaoPorSetor,
} from './dashboardAgregacoes'

const STATUS_LABELS = {
  ativo: 'Ativos',
  manutencao: 'Em manutenção',
  inativo: 'Inativos',
}

const tituloCls = 'mb-3 text-sm uppercase tracking-wide text-gray-500'
const cardCls = 'rounded-lg border border-gray-800 bg-gray-900 p-4'

// Card de alerta: número (vermelho quando > 0) + lista de equipamentos.
function CardAlerta({ titulo, equipamentos }) {
  return (
    <section className={cardCls}>
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm uppercase tracking-wide text-gray-500">
          {titulo}
        </h2>
        <span
          className={`text-2xl font-bold ${
            equipamentos.length > 0 ? 'text-red-400' : 'text-gray-100'
          }`}
        >
          {equipamentos.length}
        </span>
      </div>
      {equipamentos.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">Nenhum.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {equipamentos.map((eq) => (
            <li key={eq.id}>
              <Link
                to="/equipamentos/$id"
                params={{ id: eq.id }}
                className="text-sm text-cyan-400 hover:underline"
              >
                {eq.nome}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function DashboardPage() {
  const equipamentos = useEquipamentos()
  const manutencoes = useTodasManutencoes()

  const carregando = equipamentos.isPending || manutencoes.isPending
  const erro = equipamentos.isError || manutencoes.isError

  if (carregando) {
    return <Pagina>{<p className="text-gray-400">Carregando…</p>}</Pagina>
  }
  if (erro) {
    return (
      <Pagina>
        <p className="text-red-400">Erro ao carregar os dados.</p>
      </Pagina>
    )
  }

  const eqs = equipamentos.data
  const mans = manutencoes.data
  const porStatus = contarPorStatus(eqs)
  const atrasados = equipamentosAtrasados(eqs, mans)
  const semManutencao = equipamentosSemManutencao(eqs, mans)
  const ultimas = ultimasManutencoes(mans)
  const porSetor = distribuicaoPorSetor(eqs)

  return (
    <Pagina>
      <div className="space-y-8">
        <section>
          <h2 className={tituloCls}>Equipamentos por status</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {Object.entries(porStatus).map(([status, total]) => (
              <div key={status} className={cardCls}>
                <p className="text-3xl font-bold text-gray-100">{total}</p>
                <p className="text-sm text-gray-400">{STATUS_LABELS[status]}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <CardAlerta titulo="Manutenção atrasada" equipamentos={atrasados} />
          <CardAlerta
            titulo="Sem manutenção há +90 dias"
            equipamentos={semManutencao}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <section>
            <h2 className={tituloCls}>Últimas manutenções</h2>
            {ultimas.length === 0 ? (
              <p className="text-gray-400">Nenhuma manutenção registrada.</p>
            ) : (
              <ul className="space-y-2">
                {ultimas.map((m) => (
                  <li key={m.id} className={`${cardCls} text-sm`}>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-200">
                        {m.equipamentos?.nome ?? '—'}
                      </span>
                      <span className="text-gray-500">{m.data}</span>
                    </div>
                    <span className="text-gray-400">{m.tipo}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className={tituloCls}>Por setor</h2>
            <ul className="space-y-1">
              {Object.entries(porSetor).map(([setor, total]) => (
                <li
                  key={setor}
                  className="flex justify-between border-b border-gray-800 py-1 text-sm"
                >
                  <span className="text-gray-300">{setor}</span>
                  <span className="text-gray-400">{total}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </Pagina>
  )
}

// Casca da página (cabeçalho fixo + conteúdo).
function Pagina({ children }) {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-cyan-400">Dashboard</h1>
        <p className="text-sm text-gray-500">Visão geral dos equipamentos</p>
      </header>
      {children}
    </div>
  )
}
