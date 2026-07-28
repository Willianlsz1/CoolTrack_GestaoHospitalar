import { Foto } from '../../components/Foto'
import { IconeTipo } from './iconesTipo'

// Miniatura 40x40 da linha: a foto do equipamento, ou — quando não há —
// um ícone do tipo (altura de linha sempre igual).
const caixa = {
  width: 40,
  height: 40,
  borderRadius: 'var(--r)',
  flex: 'none',
}

export function MiniaturaEquipamento({ eq }) {
  if (eq.foto_url) {
    return (
      <Foto
        src={eq.foto_url}
        alt={eq.nome}
        loading="lazy"
        width={40}
        height={40}
        style={{ ...caixa, objectFit: 'cover' }}
      />
    )
  }

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
      <IconeTipo tipo={eq.tipo} size={20} />
    </div>
  )
}
