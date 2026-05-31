import Modal from '../../components/Modal'
import { TipoManutencaoBadge } from '../../components/TipoManutencaoBadge'
import { formatarData } from '../../core/data'

// Modal do drill-down: lista os serviços (manutenções) que um usuário
// registrou — equipamento, tipo e data. `servicos` já vem filtrado e em
// ordem desc (mais recente primeiro).
export default function ServicosUsuarioModal({ usuario, servicos, onClose }) {
  return (
    <Modal titulo={`Serviços de ${usuario}`} onClose={onClose}>
      {servicos.length === 0 ? (
        <p className="t-secondary">Nenhum serviço registrado.</p>
      ) : (
        <ul className="m-0 max-h-[60vh] list-none space-y-2 overflow-y-auto p-0">
          {servicos.map((m) => (
            <li key={m.id} className="ct-card">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[15px] text-[var(--fg)]">
                  {m.equipamentos?.nome ?? 'Equipamento removido'}
                </span>
                <TipoManutencaoBadge tipo={m.tipo} />
              </div>
              <p className="t-caption mt-1">{formatarData(m.data)}</p>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
