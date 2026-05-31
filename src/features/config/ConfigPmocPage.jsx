import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Building2, UserCog } from 'lucide-react'
import { useEhAdmin } from '../perfil/useEhAdmin'
import { useConfigPmoc, useSalvarConfigPmoc } from './useConfigPmoc'
import { Field } from '../../components/Field'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'

const grid2 = 'grid grid-cols-1 gap-3 sm:grid-cols-2'

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

export default function ConfigPmocPage() {
  const { ehAdmin, carregando } = useEhAdmin()
  const { data: config, isPending } = useConfigPmoc()

  if (carregando || isPending) return <p className="t-secondary">Carregando…</p>

  if (!ehAdmin) {
    return (
      <div>
        <h1>Configuração do PMOC</h1>
        <p className="t-secondary mt-2">
          Acesso restrito — apenas administradores configuram o documento.
        </p>
      </div>
    )
  }

  return <FormularioConfig config={config ?? {}} />
}

// Monta só após carregar, então o useState já inicializa com os valores.
function FormularioConfig({ config }) {
  const salvar = useSalvarConfigPmoc()
  const [c, setC] = useState({
    hospital_nome: config.hospital_nome ?? '',
    hospital_cnpj: config.hospital_cnpj ?? '',
    hospital_endereco: config.hospital_endereco ?? '',
    rt_nome: config.rt_nome ?? '',
    rt_conselho: config.rt_conselho ?? '',
    rt_registro: config.rt_registro ?? '',
    rt_documento: config.rt_documento ?? '',
  })
  const [salvo, setSalvo] = useState(false)

  const campo = (chave) => ({
    value: c[chave],
    onChange: (e) => {
      setC((x) => ({ ...x, [chave]: e.target.value }))
      setSalvo(false)
    },
  })

  function handleSubmit(e) {
    e.preventDefault()
    const limpo = Object.fromEntries(
      Object.entries(c).map(([k, v]) => [k, v.trim() === '' ? null : v.trim()]),
    )
    salvar.mutate(limpo, { onSuccess: () => setSalvo(true) })
  }

  return (
    <div className="max-w-[640px]">
      <Link
        to="/relatorio"
        className="ct-link inline-flex items-center gap-1 text-[13px]"
      >
        <ArrowLeft size={14} /> Voltar ao relatório
      </Link>
      <h1 className="mt-2">Configuração do PMOC</h1>
      <p className="t-secondary mt-1">
        Dados do estabelecimento e do responsável técnico que aparecem no
        documento.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <Secao icon={Building2} titulo="Estabelecimento">
          <Field label="Hospital / razão social">
            <Input {...campo('hospital_nome')} />
          </Field>
          <div className={grid2}>
            <Field label="CNPJ">
              <Input {...campo('hospital_cnpj')} />
            </Field>
            <Field label="Endereço">
              <Input {...campo('hospital_endereco')} />
            </Field>
          </div>
        </Secao>

        <Secao icon={UserCog} titulo="Responsável Técnico">
          <Field label="Nome">
            <Input {...campo('rt_nome')} />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Conselho" hint="CREA ou CFT">
              <Input placeholder="CFT" {...campo('rt_conselho')} />
            </Field>
            <Field label="Nº de registro">
              <Input {...campo('rt_registro')} />
            </Field>
            <Field label="ART / TRT">
              <Input {...campo('rt_documento')} />
            </Field>
          </div>
        </Secao>

        {salvar.isError && (
          <p className="text-[13px]" style={{ color: 'var(--danger)' }}>
            Erro: {salvar.error.message}
          </p>
        )}
        {salvo && (
          <p className="text-[13px]" style={{ color: 'var(--ok)' }}>
            Configuração salva.
          </p>
        )}

        <Button type="submit" variant="primary" disabled={salvar.isPending}>
          {salvar.isPending ? 'Salvando…' : 'Salvar configuração'}
        </Button>
      </form>
    </div>
  )
}
