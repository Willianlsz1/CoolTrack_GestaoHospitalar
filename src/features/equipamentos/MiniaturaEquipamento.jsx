import {
  Refrigerator,
  Snowflake,
  Container,
  AirVent,
  Fan,
  Box,
} from 'lucide-react'

// Miniatura 40x40 da linha: a foto do equipamento, ou — quando não há —
// um ícone do tipo (altura de linha sempre igual).
const TIPO_ICON = {
  geladeira: Refrigerator,
  freezer: Snowflake,
  camara_fria: Container,
  ar_condicionado: AirVent,
  climatizador: Fan,
  outro: Box,
}

const caixa = {
  width: 40,
  height: 40,
  borderRadius: 'var(--r)',
  flex: 'none',
}

export function MiniaturaEquipamento({ eq }) {
  if (eq.foto_url) {
    return (
      <img
        src={eq.foto_url}
        alt={eq.nome}
        style={{ ...caixa, objectFit: 'cover' }}
      />
    )
  }

  const Icone = TIPO_ICON[eq.tipo] ?? Box
  return (
    <div
      style={{
        ...caixa,
        background: 'var(--surface-2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--fg-3)',
      }}
    >
      <Icone size={20} strokeWidth={1.5} />
    </div>
  )
}
