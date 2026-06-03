import { Link } from '@tanstack/react-router'
import { Route, ArrowRight } from 'lucide-react'
import { useEquipamentos } from '../equipamentos/useEquipamentos'
import { useTodasManutencoes } from '../dashboard/useTodasManutencoes'
import { pendentesDaRonda } from './ronda'

// Barra que aparece na ficha quando se chega pela Ronda: quantos pendentes
// faltam e um atalho para o PRÓXIMO. Vive num componente próprio para que a
// busca de "todas as manutenções" só rode em modo ronda (a ficha normal
// continua leve).
export function RondaBarra({ equipamentoId }) {
  const { data: eqs = [] } = useEquipamentos()
  const { data: mans = [] } = useTodasManutencoes()

  const restantes = pendentesDaRonda(eqs, mans).filter(
    (e) => e.id !== equipamentoId,
  )
  const proximo = restantes[0] ?? null

  return (
    <div className="mt-3 flex items-center justify-between gap-3 rounded-[var(--r)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[14px]">
      <span className="inline-flex items-center gap-2 text-[var(--fg-2)]">
        <Route size={15} className="flex-none text-[var(--fg-3)]" />
        Ronda · {restantes.length} pendente
        {restantes.length === 1 ? '' : 's'} restante
        {restantes.length === 1 ? '' : 's'}
      </span>
      {proximo ? (
        <Link
          to="/equipamentos/$id"
          params={{ id: proximo.id }}
          search={{ aba: 'checklist', origem: 'ronda' }}
          className="ct-link inline-flex items-center gap-1 whitespace-nowrap"
        >
          Próximo pendente <ArrowRight size={14} />
        </Link>
      ) : (
        <span className="whitespace-nowrap" style={{ color: 'var(--ok)' }}>
          Ronda concluída ✓
        </span>
      )}
    </div>
  )
}
