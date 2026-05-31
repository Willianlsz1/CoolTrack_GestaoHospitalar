import { Gauge } from 'lucide-react'
import { Field } from '../../components/Field'
import { Input } from '../../components/Input'

// Seção ADMIN-ONLY: cadência (mensal/anual) + specs de HVAC (carga/área).
// O técnico não vê isto — o intervalo mensal já é preenchido pelo setor.
// (A trava real por coluna no banco entra na Fase 3.)
export function CamposEspecificacoes({
  intervaloMensal,
  setIntervaloMensal,
  intervaloAnual,
  setIntervaloAnual,
  cargaBtu,
  setCargaBtu,
  areaM2,
  setAreaM2,
}) {
  return (
    <section className="space-y-3">
      <p className="flex items-center gap-2 text-[13px] text-[var(--fg-3)]">
        <Gauge size={15} /> Cadência e especificações{' '}
        <span className="t-caption">(admin)</span>
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field
          label="Intervalo mensal (dias)"
          hint="Nasce do setor; ajuste se necessário."
        >
          <Input
            type="number"
            min="1"
            value={intervaloMensal}
            onChange={(e) => setIntervaloMensal(e.target.value)}
          />
        </Field>
        <Field label="Intervalo anual (dias)">
          <Input
            type="number"
            min="1"
            value={intervaloAnual}
            onChange={(e) => setIntervaloAnual(e.target.value)}
          />
        </Field>
        <Field label="Carga (BTU)">
          <Input
            type="number"
            min="0"
            value={cargaBtu}
            onChange={(e) => setCargaBtu(e.target.value)}
          />
        </Field>
        <Field label="Área climatizada (m²)">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={areaM2}
            onChange={(e) => setAreaM2(e.target.value)}
          />
        </Field>
      </div>
    </section>
  )
}
