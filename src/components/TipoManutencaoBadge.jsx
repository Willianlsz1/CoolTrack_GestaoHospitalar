import { MANUTENCAO_TIPO_LABELS } from '../features/manutencoes/rotulos'

// Badge do tipo de manutenção (preventiva/corretiva/preditiva) nas cores
// certas (.ct-badge--*).
export function TipoManutencaoBadge({ tipo }) {
  return (
    <span className={`ct-badge ct-badge--${tipo}`}>
      {MANUTENCAO_TIPO_LABELS[tipo] ?? tipo}
    </span>
  )
}
