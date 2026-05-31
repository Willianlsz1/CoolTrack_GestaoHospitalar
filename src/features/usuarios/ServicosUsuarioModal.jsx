import Modal from '../../components/Modal'
import { ServicoDetalhe } from '../manutencoes/ServicoDetalhe'

// Modal do drill-down: lista os serviços que um usuário registrou, cada um
// com o detalhe completo (descrição, peças, checklist, fotos) e o status de
// aprovação. `servicos` já vem filtrado e em ordem desc.
export default function ServicosUsuarioModal({ usuario, servicos, onClose }) {
  return (
    <Modal titulo={`Serviços de ${usuario}`} onClose={onClose}>
      {servicos.length === 0 ? (
        <p className="t-secondary">Nenhum serviço registrado.</p>
      ) : (
        <ul className="m-0 max-h-[60vh] list-none space-y-3 overflow-y-auto p-0">
          {servicos.map((m) => (
            <li key={m.id}>
              <ServicoDetalhe servico={m} />
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
