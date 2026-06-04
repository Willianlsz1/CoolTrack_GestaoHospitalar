import { useState } from 'react'
import { useCriarSetor, useAtualizarSetor } from './useSetores'
import { usePerfis } from '../perfil/usePerfis'
import { Field } from '../../components/Field'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'

// Form de setor (criar/editar). intervalo_dias é a cadência mensal padrão
// que os equipamentos do setor herdam. responsavel_id liga o setor a um
// usuário (opcional).
export default function SetorForm({ setor, onSucesso, onCancelar }) {
  const editando = Boolean(setor)
  const [nome, setNome] = useState(setor?.nome ?? '')
  const [intervalo, setIntervalo] = useState(
    String(setor?.intervalo_dias ?? 30),
  )
  const [responsavelId, setResponsavelId] = useState(
    setor?.responsavel_id ?? '',
  )
  const [erro, setErro] = useState('')

  const { data: perfis } = usePerfis()
  const criar = useCriarSetor()
  const atualizar = useAtualizarSetor()
  const mutation = editando ? atualizar : criar

  function handleSubmit(e) {
    e.preventDefault()

    if (nome.trim() === '') {
      setErro('Informe o nome do setor.')
      return
    }
    const dias = Number(intervalo)
    if (!Number.isInteger(dias) || dias < 1) {
      setErro('Intervalo deve ser um número de dias maior que zero.')
      return
    }
    setErro('')

    const dados = {
      nome: nome.trim(),
      intervalo_dias: dias,
      // '' (nenhum) vira null para a coluna aceitar "sem responsável".
      responsavel_id: responsavelId || null,
    }
    if (editando) {
      atualizar.mutate({ id: setor.id, ...dados }, { onSuccess: onSucesso })
    } else {
      criar.mutate(dados, { onSuccess: onSucesso })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Nome" required>
        <Input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: CME"
        />
      </Field>
      <Field
        label="Intervalo de manutenção (dias)"
        required
        hint="Cadência mensal padrão do setor. Ex.: CME = 15, demais = 30."
      >
        <Input
          type="number"
          min="1"
          value={intervalo}
          onChange={(e) => setIntervalo(e.target.value)}
        />
      </Field>
      <Field
        label="Responsável"
        hint="Técnico que responde por este setor. Opcional."
      >
        <Select
          value={responsavelId}
          onChange={(e) => setResponsavelId(e.target.value)}
        >
          <option value="">— Sem responsável —</option>
          {perfis?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome || 'Sem nome'}
            </option>
          ))}
        </Select>
      </Field>

      {erro && <p className="ct-error">{erro}</p>}
      {mutation.isError && (
        <p className="text-[14px]" style={{ color: 'var(--danger)' }}>
          Erro: {mutation.error.message}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={mutation.isPending}>
          {mutation.isPending ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
