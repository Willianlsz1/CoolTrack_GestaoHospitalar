import { createElement } from 'react'
import {
  Refrigerator,
  Snowflake,
  Container,
  AirVent,
  Fan,
  Box,
} from 'lucide-react'

// Ícone (lucide) por tipo de equipamento. Reusado na miniatura da lista,
// nas linhas dos alertas e nas últimas manutenções do dashboard.
export const TIPO_ICON = {
  geladeira: Refrigerator,
  freezer: Snowflake,
  camara_fria: Container,
  ar_condicionado: AirVent,
  climatizador: Fan,
  outro: Box,
}

export function iconeDoTipo(tipo) {
  return TIPO_ICON[tipo] ?? Box
}

// Wrapper estável que renderiza o ícone do tipo (createElement evita
// "componente criado durante o render"). Use <IconeTipo tipo size .../>.
export function IconeTipo({ tipo, ...props }) {
  return createElement(iconeDoTipo(tipo), props)
}
