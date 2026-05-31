import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { STATUS, STATUS_LABELS } from './rotulos'

// Barra de filtros da lista: busca (nome/série) + setor + status.
// Os setores vêm prontos (derivados da lista de equipamentos).
export function FiltrosEquipamentos({
  busca,
  setBusca,
  setor,
  setSetor,
  status,
  setStatus,
  setores,
}) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="sm:flex-1">
        <Input
          placeholder="Buscar por nome ou nº de série…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="sm:w-48">
        <Select value={setor} onChange={(e) => setSetor(e.target.value)}>
          <option value="">Todos os setores</option>
          {setores.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div className="sm:w-48">
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {STATUS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}
