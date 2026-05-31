import { useManutencoes } from '../manutencoes/useManutencoes'
import { preverManutencao } from './previsao'
import { formatarData } from '../../core/data'

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

  const { intervalo, proxima } = preverManutencao(manutencoes)

  return (
    <section className="mt-6 border-t border-[var(--border)] pt-6">
      <h2 className="mb-3 text-[13px] text-[var(--fg-3)]">
        Sugestão (estatística)
      </h2>
      {!intervalo ? (
        <p className="t-secondary">
          Dados insuficientes — são necessárias ao menos 2 manutenções em datas
          diferentes.
        </p>
      ) : (
        <div className="ct-card text-sm">
          <p className="t-secondary">
            Intervalo médio entre manutenções:{' '}
            <span className="text-[var(--fg)]">{intervalo} dias</span>
          </p>
          <p className="t-secondary mt-1">
            Próxima preventiva sugerida:{' '}
            <span className="text-[var(--link)]">{formatarData(proxima)}</span>
          </p>
        </div>
      )}
    </section>
  )
}
