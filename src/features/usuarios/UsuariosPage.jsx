import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { SomenteAdmin } from '../../components/SomenteAdmin'
import { usePerfis } from '../perfil/usePerfis'
import { useSetores } from '../setores/useSetores'
import { useTodasManutencoes } from '../dashboard/useTodasManutencoes'
import { useToast } from '../feedback/useToast'
import { resumoUsuarios, servicosDoUsuario } from './usuariosAgregacoes'
import { formatarData } from '../../core/data'
import { Button } from '../../components/Button'
import Modal from '../../components/Modal'
import UsuarioForm from './UsuarioForm'
import ServicosUsuarioModal from './ServicosUsuarioModal'

// Página de gestão de usuários (só admin). A trava REAL é na Edge Function
// e no RLS; a guarda aqui é UX/defesa.
export default function UsuariosPage() {
  return (
    <SomenteAdmin titulo="Usuários">
      <GestaoUsuarios />
    </SomenteAdmin>
  )
}

// Badge do papel. Trocar o papel é SQL-only de propósito (migração 0017),
// então aqui é só leitura.
function PapelBadge({ role }) {
  const admin = role === 'admin'
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[13px] ${
        admin
          ? 'border-[var(--link)] text-[var(--link)]'
          : 'border-[var(--border)] text-[var(--fg-2)]'
      }`}
    >
      {admin ? 'Admin' : 'Técnico'}
    </span>
  )
}

function GestaoUsuarios() {
  const {
    data: perfis = [],
    isPending: perfisPend,
    isError,
    error,
  } = usePerfis()
  const { data: setores = [], isPending: setoresPend } = useSetores()
  const { data: manutencoes = [], isPending: manPend } = useTodasManutencoes()

  const [formAberto, setFormAberto] = useState(false)
  // Usuário cujo modal de serviços está aberto (ou null).
  const [servicosDe, setServicosDe] = useState(null)
  const toast = useToast()

  const buscando = perfisPend || setoresPend || manPend
  const resumoMap = resumoUsuarios(perfis, setores, manutencoes)

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1>Usuários</h1>
          <p className="t-secondary mt-1">
            Quem tem acesso, setores que responde e serviços realizados.
          </p>
        </div>
        <Button
          variant="primary"
          icon={UserPlus}
          onClick={() => setFormAberto(true)}
        >
          Novo usuário
        </Button>
      </div>

      {buscando && <p className="t-secondary">Carregando…</p>}
      {isError && (
        <p style={{ color: 'var(--danger)' }}>Erro: {error.message}</p>
      )}

      {!buscando && !isError && (
        <div className="ct-card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="ct-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Papel</th>
                <th>Setores</th>
                <th>Serviços</th>
              </tr>
            </thead>
            <tbody>
              {perfis.map((p) => {
                const r = resumoMap.get(p.id)
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="text-[15px] text-[var(--fg)]">
                        {p.nome || '(sem nome)'}
                      </div>
                      <div className="t-caption">{p.email}</div>
                    </td>
                    <td>
                      <PapelBadge role={p.role} />
                    </td>
                    <td className="text-[var(--fg-2)]">
                      {r.setores.length > 0 ? r.setores.join(', ') : '—'}
                    </td>
                    <td>
                      {r.totalServicos === 0 ? (
                        <span className="text-[var(--fg-3)]">Nenhum</span>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-[var(--fg-2)]">
                            <span className="text-[var(--fg)]">
                              {r.totalServicos}
                            </span>{' '}
                            · último {formatarData(r.ultimoServico)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setServicosDe(p)}
                            className="ct-link text-[14px]"
                          >
                            Ver
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {formAberto && (
        <Modal titulo="Novo usuário" onClose={() => setFormAberto(false)}>
          <UsuarioForm
            onSucesso={() => {
              setFormAberto(false)
              toast.sucesso('Usuário criado')
            }}
            onCancelar={() => setFormAberto(false)}
          />
        </Modal>
      )}

      {servicosDe && (
        <ServicosUsuarioModal
          usuario={servicosDe.nome || servicosDe.email}
          servicos={servicosDoUsuario(manutencoes, servicosDe.id)}
          onClose={() => setServicosDe(null)}
        />
      )}
    </div>
  )
}
