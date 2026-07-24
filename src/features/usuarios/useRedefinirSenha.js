import { useMutation } from '@tanstack/react-query'
import { redefinirSenha } from './redefinirSenha'

// Mutation para redefinir a senha de outro usuário (admin, via Edge
// Function). Não invalida cache nenhum: nada do que as telas mostram muda —
// `senha_trocada_em` só é lido pelo portão do AppLayout, e quem o consulta é
// a sessão da PESSOA redefinida, não a do admin.
export function useRedefinirSenha() {
  return useMutation({ mutationFn: redefinirSenha })
}
