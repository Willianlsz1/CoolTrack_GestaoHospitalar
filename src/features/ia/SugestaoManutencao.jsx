import { useManutencoes } from '../manutencoes/useManutencoes'
import { intervaloMedioDias, proximaSugerida } from './previsao'

// Sugestão estatística na ficha. Reusa o cache do histórico (mesma
// queryKey ['manutencoes', id]) — não faz busca extra. Fica discreta
// enquanto carrega/erra (a ficha já trata esses estados).
export default function SugestaoManutencao({ equipamentoId }) {
  const {
    data: manutencoes,
    isPending,
    isError,
  } = useManutencoes(equipamentoId)

  if (isPending || isError) return null

  const intervalo = intervaloMedioDias(manutencoes)
  const proxima = proximaSugerida(manutencoes)

  return (
    <section className="mt-6 border-t border-gray-800 pt-6">
      <h2 className="mb-3 text-sm uppercase tracking-wide text-gray-500">
        Sugestão (estatística)
      </h2>
      {!intervalo ? (
        <p className="text-sm text-gray-500">
          Dados insuficientes — são necessárias ao menos 2 manutenções em datas
          diferentes.
        </p>
      ) : (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-sm">
          <p className="text-gray-400">
            Intervalo médio entre manutenções:{' '}
            <span className="text-gray-200">{intervalo} dias</span>
          </p>
          <p className="mt-1 text-gray-400">
            Próxima preventiva sugerida:{' '}
            <span className="text-cyan-400">{proxima}</span>
          </p>
        </div>
      )}
    </section>
  )
}
