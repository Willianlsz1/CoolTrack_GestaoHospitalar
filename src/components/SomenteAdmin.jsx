import { useEhAdmin } from '../features/perfil/useEhAdmin'
import { Carregando } from './Estado'

// Guarda de UX: renderiza `children` só para admin; senão, mostra o título
// da página + aviso de acesso restrito. A trava REAL é sempre o RLS do banco
// (e a Edge Function), não esta verificação.
export function SomenteAdmin({ titulo, children }) {
  const { ehAdmin, carregando } = useEhAdmin()

  if (carregando) return <Carregando />

  if (!ehAdmin) {
    return (
      <div>
        <h1>{titulo}</h1>
        <p className="t-secondary mt-2">
          Acesso restrito — apenas administradores.
        </p>
      </div>
    )
  }

  return children
}
