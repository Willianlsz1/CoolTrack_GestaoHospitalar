import { ChartPie } from 'lucide-react'
import { StatCard } from './StatCard'
import { ProporcaoBar } from './ProporcaoBar'
import { percentual } from './dashboardAgregacoes'

// Nível 2 — panorama: 3 stat cards + barra de proporção.
export function PanoramaStatus({ contagem, total }) {
  return (
    <section>
      <p className="mb-[10px] flex items-center gap-2 text-[13px] text-[var(--fg-3)]">
        <ChartPie size={14} /> Equipamentos por status
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          variant="ativo"
          label="Ativos"
          num={contagem.ativo}
          pct={percentual(contagem.ativo, total)}
        />
        <StatCard
          variant="manutencao"
          label="Em manutenção"
          num={contagem.manutencao}
          pct={percentual(contagem.manutencao, total)}
        />
        <StatCard
          variant="inativo"
          label="Inativos"
          num={contagem.inativo}
          pct={percentual(contagem.inativo, total)}
        />
      </div>
      <ProporcaoBar contagem={contagem} total={total} />
    </section>
  )
}
