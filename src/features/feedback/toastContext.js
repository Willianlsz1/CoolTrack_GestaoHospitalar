import { createContext } from 'react'

// Contexto do toast separado do Provider para o componente exportar só
// componente (regra react-refresh/only-export-components).
export const ToastContext = createContext(null)
