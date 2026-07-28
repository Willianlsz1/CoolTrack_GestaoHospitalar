import { CircleCheck, Wrench, CircleSlash } from 'lucide-react'
import { STATUS_LABELS } from '../features/equipamentos/rotulos'

// Badge sóbrio de status (ativo/manutenção/inativo): preenchimento
// translúcido + texto colorido + borda 0.5px (classes .ct-badge--*).
const ICONES = {
  ativo: CircleCheck,
  manutencao: Wrench,
  inativo: CircleSlash,
}

export function StatusBadge({ status }) {
  const Icone = ICONES[status]
  return (
    <span className={`ct-badge ct-badge--${status}`}>
      {Icone && <Icone size={16} />}
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
