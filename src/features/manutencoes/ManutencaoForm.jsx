import { useState } from 'react'
import { Check, Camera, CircleAlert } from 'lucide-react'
import { useCriarManutencao } from './useCriarManutencao'
import { hojeLocal } from '../../core/data'
import { MANUTENCAO_TIPOS, MANUTENCAO_TIPO_LABELS } from './rotulos'
import { Field } from '../../components/Field'
import { Input } from '../../components/Input'
import { Textarea } from '../../components/Textarea'
import { Button } from '../../components/Button'

// Limite de tamanho de cada foto (5 MB).
const MAX_FOTO_BYTES = 5 * 1024 * 1024

// Estilo do seletor de arquivo (mesmo do CampoFoto, mantém coesão).
const fileInputCls =
  'block w-full text-[14px] text-[var(--fg-2)] file:mr-3 file:rounded-[var(--r)] file:border file:border-[var(--border)] file:bg-[var(--surface-2)] file:px-3 file:py-1.5 file:text-[14px] file:text-[var(--fg)] hover:file:bg-[var(--surface)]'

// Tipo como chips coloridos (substitui o <select>). Clicar seleciona;
// o selecionado mostra ✓ e ganha a cor do tipo (via .ct-chip.is-sel).
function ChipsTipo({ valor, aoSelecionar, erro, tipos = MANUTENCAO_TIPOS }) {
  return (
    <div className={`ct-chips${erro ? ' ct-chips--err' : ''}`}>
      {tipos.map((t) => {
        const sel = valor === t
        return (
          <button
            key={t}
            type="button"
            data-tipo={t}
            className={`ct-chip${sel ? ' is-sel' : ''}`}
            onClick={() => aoSelecionar(t)}
            aria-pressed={sel}
          >
            {sel ? (
              <Check size={14} />
            ) : (
              <span className="ct-chip-dot" aria-hidden="true" />
            )}
            {MANUTENCAO_TIPO_LABELS[t]}
          </button>
        )
      })}
    </div>
  )
}

// Uma célula de foto: legenda (câmera + rótulo) + seletor de arquivo.
function CelulaFoto({ id, rotulo, aoEscolher }) {
  return (
    <div>
      <span className="ct-label flex items-center gap-1.5">
        <Camera size={14} className="text-[var(--fg-3)]" /> {rotulo}
      </span>
      <input
        id={id}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => aoEscolher(e.target.files[0] ?? null)}
        className={fileInputCls}
      />
    </div>
  )
}

export default function ManutencaoForm({
  equipamentoId,
  tipos,
  tipoInicial,
  descricaoInicial,
  onSucesso,
  onCancelar,
}) {
  const [tipo, setTipo] = useState(tipoInicial ?? '')
  const [data, setData] = useState(hojeLocal())
  const [descricao, setDescricao] = useState(descricaoInicial ?? '')
  const [pecas, setPecas] = useState('')
  const [proxima, setProxima] = useState('')
  const [fotoAntes, setFotoAntes] = useState(null)
  const [fotoDepois, setFotoDepois] = useState(null)
  const [erroValidacao, setErroValidacao] = useState('')

  const criar = useCriarManutencao()

  function handleSubmit(e) {
    e.preventDefault()

    if (tipo === '') {
      setErroValidacao('Selecione o tipo da manutenção.')
      return
    }
    if (data === '') {
      setErroValidacao('Informe a data.')
      return
    }
    if (
      (fotoAntes && fotoAntes.size > MAX_FOTO_BYTES) ||
      (fotoDepois && fotoDepois.size > MAX_FOTO_BYTES)
    ) {
      setErroValidacao('Foto muito grande (máx. 5 MB).')
      return
    }
    setErroValidacao('')

    criar.mutate(
      {
        equipamento_id: equipamentoId,
        tipo,
        data,
        // Opcionais: vazio vira null. (O técnico é gravado automaticamente
        // pelo banco como o usuário logado — registrado_por.)
        descricao: descricao.trim() || null,
        pecas: pecas.trim() || null,
        proxima_manutencao: proxima || null,
        // File ou null; o hook sobe as fotos antes de inserir.
        fotoAntes,
        fotoDepois,
      },
      { onSuccess: onSucesso },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-[18px]">
      <Field label="Tipo" required>
        <ChipsTipo
          valor={tipo}
          aoSelecionar={setTipo}
          erro={tipo === '' && Boolean(erroValidacao)}
          tipos={tipos}
        />
      </Field>

      <Field label="Data" required>
        <Input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
      </Field>

      <Field label="Descrição">
        <Textarea
          placeholder="O que foi verificado e executado na visita…"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </Field>

      <Field label="Peças trocadas">
        <Input value={pecas} onChange={(e) => setPecas(e.target.value)} />
      </Field>

      <Field label="Próxima manutenção">
        <Input
          type="date"
          value={proxima}
          onChange={(e) => setProxima(e.target.value)}
        />
      </Field>

      <div>
        <span className="ct-label">Fotos antes e depois</span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CelulaFoto
            id="foto-antes"
            rotulo="Foto antes"
            aoEscolher={setFotoAntes}
          />
          <CelulaFoto
            id="foto-depois"
            rotulo="Foto depois"
            aoEscolher={setFotoDepois}
          />
        </div>
      </div>

      {erroValidacao && (
        <p
          className="flex items-center gap-1.5 text-[14px]"
          style={{ color: 'var(--warn)' }}
        >
          <CircleAlert size={14} /> {erroValidacao}
        </p>
      )}
      {criar.isError && (
        <p
          className="flex items-center gap-1.5 text-[14px]"
          style={{ color: 'var(--danger)' }}
        >
          <CircleAlert size={14} /> Erro ao salvar: {criar.error.message}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={criar.isPending}>
          {criar.isPending ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
