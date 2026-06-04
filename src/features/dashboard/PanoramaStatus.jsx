import { ChartPie } from 'lucide-react'
import { ProporcaoBar } from './ProporcaoBar'

// Nível 2 — panorama do parque: barra de proporção + legenda (com contagem e
// %). Antes eram 3 stat cards grandes + barra + legenda, mostrando o mesmo
// 16/1/1 três vezes; agora é uma peça fina só, sem redundância.
export function PanoramaStatus({ contagem, total }) {
  return (
    <section className="ct-card">
      <p className="flex items-center gap-2 text-[14px] text-[var(--fg-3)]">
        <ChartPie size={14} /> Equipamentos por status
      </p>
      <ProporcaoBar contagem={contagem} total={total} />
    </section>
  )
}
