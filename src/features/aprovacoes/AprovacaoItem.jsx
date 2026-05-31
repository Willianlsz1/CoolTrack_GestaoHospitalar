import { useState } from 'react'
import { ServicoDetalhe } from '../manutencoes/ServicoDetalhe'
import { useAprovarManutencao } from '../manutencoes/useAprovarManutencao'
import { Button } from '../../components/Button'
import { Textarea } from '../../components/Textarea'

// Um item da fila de PENDENTES: o detalhe do serviço com as ações
// Aprovar / Reprovar no rodapé do card. Ao decidir, a mutação invalida as
// manutenções e o item sai dos pendentes.
export function AprovacaoItem({ servico }) {
  const aprovar = useAprovarManutencao()
  const [reprovando, setReprovando] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState('')

  function confirmarReprovar() {
    if (motivo.trim() === '') {
      setErro('Informe o motivo da reprovação.')
      return
    }
    setErro('')
    aprovar.mutate({
      id: servico.id,
      status: 'reprovado',
      motivo: motivo.trim(),
    })
  }

  return (
    <li>
      <ServicoDetalhe servico={servico}>
        {!reprovando ? (
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={() =>
                aprovar.mutate({ id: servico.id, status: 'aprovado' })
              }
              disabled={aprovar.isPending}
            >
              Aprovar
            </Button>
            <Button
              variant="secondary"
              onClick={() => setReprovando(true)}
              disabled={aprovar.isPending}
            >
              Reprovar
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo da reprovação (o técnico verá)…"
            />
            {erro && <p className="ct-error">{erro}</p>}
            <div className="flex gap-2">
              <Button
                variant="danger"
                onClick={confirmarReprovar}
                disabled={aprovar.isPending}
              >
                Confirmar reprovação
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setReprovando(false)
                  setMotivo('')
                  setErro('')
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {aprovar.isError && (
          <p className="mt-2 text-[14px]" style={{ color: 'var(--danger)' }}>
            {aprovar.error.message}
          </p>
        )}
      </ServicoDetalhe>
    </li>
  )
}
