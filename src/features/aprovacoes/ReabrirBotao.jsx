import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useReabrirManutencao } from '../manutencoes/useAprovarManutencao'
import { useToast } from '../feedback/useToast'

// Reabre um serviço já decidido (volta para Pendentes). Pede confirmação
// inline antes de agir — gestor erra clique, e isso desfaz uma decisão.
// Vai como rodapé do ServicoDetalhe nas abas Aprovados/Reprovados.
export function ReabrirBotao({ servicoId }) {
  const [confirmando, setConfirmando] = useState(false)
  const reabrir = useReabrirManutencao()
  const toast = useToast()

  function confirmar() {
    reabrir.mutate(servicoId, {
      onSuccess: () => {
        setConfirmando(false)
        toast.sucesso('Serviço reaberto — voltou para Pendentes.')
      },
      onError: () => toast.erro('Não foi possível reabrir o serviço.'),
    })
  }

  if (confirmando) {
    return (
      <div className="flex items-center gap-3 text-[14px]">
        <span className="text-[var(--fg-2)]">
          Reabrir? Volta para Pendentes.
        </span>
        <button
          type="button"
          onClick={confirmar}
          disabled={reabrir.isPending}
          className="rounded-[var(--r)] px-2 py-1 text-[13px]"
          style={{ color: 'var(--link)' }}
        >
          Confirmar
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="rounded-[var(--r)] px-2 py-1 text-[13px] text-[var(--fg-3)] hover:text-[var(--fg)]"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirmando(true)}
      className="inline-flex items-center gap-1.5 text-[14px] text-[var(--fg-2)] hover:text-[var(--fg)]"
    >
      <RotateCcw size={16} /> Reabrir
    </button>
  )
}
