import { useState } from 'react'
import { Tag, ClipboardList, MapPin, Calendar, CircleAlert } from 'lucide-react'
import { useCriarEquipamento } from './useCriarEquipamento'
import { useAtualizarEquipamento } from './useAtualizarEquipamento'
import { useSetores } from '../setores/useSetores'
import { useEhAdmin } from '../perfil/useEhAdmin'
import { TIPOS, STATUS, TIPO_LABELS, STATUS_LABELS } from './rotulos'
import { Field } from '../../components/Field'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { CampoFoto } from './CampoFoto'
import { CamposEspecificacoes } from './CamposEspecificacoes'

// Limite de tamanho da foto (5 MB). O accept="image/*" já restringe o tipo.
const MAX_FOTO_BYTES = 5 * 1024 * 1024

// Texto vazio (após trim) vira null — campos opcionais não gravam ''.
const ouNull = (s) => (s.trim() === '' ? null : s.trim())

// String numérica -> número (ou null se vazia/inválida).
const ouNumero = (s) => {
  const t = String(s ?? '').trim()
  if (t === '') return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

// Seção do formulário: rótulo com ícone + os campos.
function Secao({ icon: Icone, titulo, children }) {
  return (
    <section className="space-y-3">
      <p className="flex items-center gap-2 text-[13px] text-[var(--fg-3)]">
        <Icone size={15} /> {titulo}
      </p>
      {children}
    </section>
  )
}

const grid2 = 'grid grid-cols-1 gap-3 sm:grid-cols-2'

// Form reaproveitado nos dois modos:
// - sem `equipamento`  -> modo CRIAR
// - com `equipamento`  -> modo EDITAR (pré-preenche e atualiza)
export default function EquipamentosForm({
  equipamento,
  onSucesso,
  onCancelar,
}) {
  const editando = Boolean(equipamento)

  // Os estados iniciais vêm do equipamento quando editando. O form é
  // remontado a cada abertura do modal, então o pré-preenchimento funciona.
  const [nome, setNome] = useState(equipamento?.nome ?? '')
  const [tipo, setTipo] = useState(equipamento?.tipo ?? '')
  const [status, setStatus] = useState(equipamento?.status ?? 'ativo')
  const [marca, setMarca] = useState(equipamento?.marca ?? '')
  const [modelo, setModelo] = useState(equipamento?.modelo ?? '')
  const [serie, setSerie] = useState(equipamento?.serie ?? '')
  const [patrimonio, setPatrimonio] = useState(equipamento?.patrimonio ?? '')
  const [setorId, setSetorId] = useState(equipamento?.setor_id ?? '')
  const [andar, setAndar] = useState(equipamento?.andar ?? '')
  const [sala, setSala] = useState(equipamento?.sala ?? '')
  const [instalacao, setInstalacao] = useState(
    equipamento?.data_instalacao ?? '',
  )
  const [garantia, setGarantia] = useState(equipamento?.data_garantia ?? '')
  // Cadência e specs (admin). intervalo_mensal nasce do setor.
  const [intervaloMensal, setIntervaloMensal] = useState(
    String(equipamento?.intervalo_mensal ?? ''),
  )
  const [intervaloAnual, setIntervaloAnual] = useState(
    String(equipamento?.intervalo_anual ?? 365),
  )
  const [cargaBtu, setCargaBtu] = useState(String(equipamento?.carga_btu ?? ''))
  const [areaM2, setAreaM2] = useState(String(equipamento?.area_m2 ?? ''))
  const [foto, setFoto] = useState(null)
  const [removerFoto, setRemoverFoto] = useState(false)
  const [erroValidacao, setErroValidacao] = useState('')

  const { ehAdmin } = useEhAdmin()
  const { data: setores } = useSetores()
  const criar = useCriarEquipamento()
  const atualizar = useAtualizarEquipamento()
  // A mutation ativa do momento — usada para loading/erro.
  const mutation = editando ? atualizar : criar

  // Ao escolher um setor, o intervalo mensal nasce do default dele. O
  // técnico não vê o campo, mas o valor é gravado assim mesmo.
  function aoMudarSetor(id) {
    setSetorId(id)
    const s = (setores ?? []).find((x) => x.id === id)
    setIntervaloMensal(s ? String(s.intervalo_dias) : '')
  }

  function handleSubmit(e) {
    e.preventDefault()

    // Validação mínima no cliente.
    if (nome.trim() === '') {
      setErroValidacao('Informe o nome do equipamento.')
      return
    }
    if (tipo === '') {
      setErroValidacao('Selecione o tipo do equipamento.')
      return
    }
    if (foto && foto.size > MAX_FOTO_BYTES) {
      setErroValidacao('Foto muito grande (máx. 5 MB).')
      return
    }
    setErroValidacao('')

    const dados = {
      nome: nome.trim(),
      tipo,
      status,
      marca: ouNull(marca),
      modelo: ouNull(modelo),
      serie: ouNull(serie),
      patrimonio: ouNull(patrimonio),
      setor_id: setorId || null,
      andar: ouNull(andar),
      sala: ouNull(sala),
      // Datas vazias precisam ser null: o tipo `date` recusa ''.
      data_instalacao: instalacao || null,
      data_garantia: garantia || null,
      // Cadência/specs: intervalo_mensal vem do setor; anual default 365.
      intervalo_mensal: ouNumero(intervaloMensal),
      intervalo_anual: ouNumero(intervaloAnual) ?? 365,
      carga_btu: ouNumero(cargaBtu),
      area_m2: ouNumero(areaM2),
    }

    if (editando) {
      // foto nova = troca; senão removerFoto = limpa; senão mantém.
      // fotoAntiga permite ao hook apagar o arquivo trocado/removido.
      atualizar.mutate(
        {
          id: equipamento.id,
          foto,
          removerFoto,
          fotoAntiga: equipamento.foto_url,
          ...dados,
        },
        { onSuccess: onSucesso },
      )
    } else {
      criar.mutate({ foto, ...dados }, { onSuccess: onSucesso })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="t-secondary -mt-1">Campos com * são obrigatórios.</p>

      <Secao icon={Tag} titulo="Identificação">
        <Field label="Nome" required>
          <Input
            placeholder="Ex.: Geladeira de medicamentos"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </Field>
        <div className={grid2}>
          <Field label="Tipo" required>
            <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="" disabled>
                Selecione…
              </option>
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {TIPO_LABELS[t]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Secao>

      <Secao icon={ClipboardList} titulo="Especificações">
        <div className={grid2}>
          <Field label="Marca">
            <Input value={marca} onChange={(e) => setMarca(e.target.value)} />
          </Field>
          <Field label="Modelo">
            <Input value={modelo} onChange={(e) => setModelo(e.target.value)} />
          </Field>
          <Field label="Nº de série">
            <Input value={serie} onChange={(e) => setSerie(e.target.value)} />
          </Field>
          <Field label="Patrimônio">
            <Input
              value={patrimonio}
              onChange={(e) => setPatrimonio(e.target.value)}
            />
          </Field>
        </div>
      </Secao>

      <Secao icon={MapPin} titulo="Localização">
        <Field label="Setor">
          <Select
            value={setorId}
            onChange={(e) => aoMudarSetor(e.target.value)}
          >
            <option value="">Sem setor</option>
            {(setores ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </Select>
        </Field>
        <div className={grid2}>
          <Field label="Andar">
            <Input value={andar} onChange={(e) => setAndar(e.target.value)} />
          </Field>
          <Field label="Sala">
            <Input value={sala} onChange={(e) => setSala(e.target.value)} />
          </Field>
        </div>
      </Secao>

      {ehAdmin && (
        <CamposEspecificacoes
          intervaloMensal={intervaloMensal}
          setIntervaloMensal={setIntervaloMensal}
          intervaloAnual={intervaloAnual}
          setIntervaloAnual={setIntervaloAnual}
          cargaBtu={cargaBtu}
          setCargaBtu={setCargaBtu}
          areaM2={areaM2}
          setAreaM2={setAreaM2}
        />
      )}

      <Secao icon={Calendar} titulo="Datas e foto">
        <div className={grid2}>
          <Field label="Instalação">
            <Input
              type="date"
              value={instalacao}
              onChange={(e) => setInstalacao(e.target.value)}
            />
          </Field>
          <Field label="Garantia até">
            <Input
              type="date"
              value={garantia}
              onChange={(e) => setGarantia(e.target.value)}
            />
          </Field>
        </div>
        <CampoFoto
          setFoto={setFoto}
          removerFoto={removerFoto}
          setRemoverFoto={setRemoverFoto}
          fotoUrlAtual={equipamento?.foto_url}
          editando={editando}
        />
      </Secao>

      {erroValidacao && (
        <p
          className="flex items-center gap-1.5 text-[13px]"
          style={{ color: 'var(--warn)' }}
        >
          <CircleAlert size={14} /> {erroValidacao}
        </p>
      )}
      {mutation.isError && (
        <p className="text-[13px]" style={{ color: 'var(--danger)' }}>
          Erro ao salvar: {mutation.error.message}
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
