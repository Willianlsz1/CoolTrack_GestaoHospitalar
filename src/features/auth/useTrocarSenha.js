import { useMutation, useQueryClient } from '@tanstack/react-query'
import { trocarSenha } from './authApi'
import { marcarSenhaTrocada } from '../perfil/perfilQueries'

// Troca a senha em DOIS passos: a credencial na Auth e a marca no perfil.
//
// A ordem importa. Primeiro a senha (é o que vale de verdade); só depois a
// marca. Se a marca falhar, o usuário fica com a senha nova e vê a tela de
// troca de novo no próximo acesso — chato, mas seguro. O inverso (marcar
// antes) deixaria alguém marcado como "senha própria" ainda usando a senha
// que o admin conhece — exatamente o que a 0029 veio impedir.
export function useTrocarSenha() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (novaSenha) => {
      await trocarSenha(novaSenha)
      await marcarSenhaTrocada()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfil', 'meu'] })
    },
  })
}
