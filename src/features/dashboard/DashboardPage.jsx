import { useEquipamentos } from '../equipamentos/useEquipamentos'
import { useTodasManutencoes } from './useTodasManutencoes'

const STATUS_LABELS = {
  ativo: 'Ativos',
  manutencao: 'Em manutenção',
  inativo: 'Inativos',
}

// Conta os equipamentos por status (mantém a ordem fixa dos rótulos).
function contarPorStatus(equipamentos) {
  const contagem = { ativo: 0, manutencao: 0, inativo: 0 }
  for (const eq of equipamentos) {
    if (contagem[eq.status] !== undefined) {
      contagem[eq.status] += 1
    }
  }
  return contagem
}

export default function DashboardPage() {
  const equipamentos = useEquipamentos()
  // Buscado aqui para já estabelecer o pipeline; os widgets que usam
  // manutenções entram no passo 4b.
  const manutencoes = useTodasManutencoes()

  const carregando = equipamentos.isPending || manutencoes.isPending
  const erro = equipamentos.isError || manutencoes.isError

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-cyan-400">Dashboard</h1>
        <p className="text-sm text-gray-500">Visão geral dos equipamentos</p>
      </header>

      {carregando && <p className="text-gray-400">Carregando…</p>}
      {erro && <p className="text-red-400">Erro ao carregar os dados.</p>}

      {!carregando && !erro && (
        <section>
          <h2 className="mb-3 text-sm uppercase tracking-wide text-gray-500">
            Equipamentos por status
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {Object.entries(contarPorStatus(equipamentos.data)).map(
              ([status, total]) => (
                <div
                  key={status}
                  className="rounded-lg border border-gray-800 bg-gray-900 p-4"
                >
                  <p className="text-3xl font-bold text-gray-100">{total}</p>
                  <p className="text-sm text-gray-400">
                    {STATUS_LABELS[status]}
                  </p>
                </div>
              ),
            )}
          </div>
        </section>
      )}
    </div>
  )
}
