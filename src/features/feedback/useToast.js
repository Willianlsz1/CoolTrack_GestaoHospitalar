import { useContext } from 'react'
import { ToastContext } from './toastContext'

// Feedback efemero: const toast = useToast(); toast.sucesso('Salvo').
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>.')
  return ctx
}
