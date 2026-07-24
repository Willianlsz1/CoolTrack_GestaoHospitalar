// Regra de senha nova — função pura, para poder ser testada sem tela.
//
// Mínimo de 8 (a Edge Function criar-usuario aceita 6 porque aquela senha é
// TEMPORÁRIA e vive minutos; a definitiva, que assina os checklists, merece
// uma barra mais alta).
export const MIN_SENHA = 8

// Devolve a mensagem de erro, ou null quando está tudo certo.
export function validarNovaSenha(senha, confirmacao) {
  if (senha.length < MIN_SENHA) {
    return `A senha deve ter ao menos ${MIN_SENHA} caracteres.`
  }
  if (senha !== confirmacao) {
    return 'As senhas não conferem.'
  }
  return null
}
