import { KeyRound } from 'lucide-react'
import { FormTrocaSenha } from './FormTrocaSenha'
import { useSair } from './useSair'
import { Button } from '../../components/Button'

// Portão do primeiro acesso: enquanto o perfil não tiver senha_trocada_em
// (0029), a senha em uso é a temporária que o ADMIN digitou ao criar a conta.
// Nada do app abre antes da troca — nem para o admin.
//
// Por que barrar tudo em vez de só avisar: o que o técnico faz aqui dentro
// vira assinatura no checklist do PMOC. Assinar com uma credencial que outra
// pessoa conhece é o problema que esta tela existe para não deixar acontecer.
export default function TrocaSenhaObrigatoria() {
  const sair = useSair()

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-6">
      <div className="w-full max-w-[380px] rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound size={20} style={{ color: 'var(--link)' }} />
          <h1 className="text-[19px] font-medium">Defina sua senha</h1>
        </div>

        <p className="t-secondary mb-5">
          A senha atual foi criada pelo administrador e é temporária. Escolha
          uma senha que só você conheça — é ela que assina os checklists no seu
          nome.
        </p>

        <FormTrocaSenha textoBotao="Definir senha" />

        <div className="mt-4 border-t border-[var(--border)] pt-3 text-center">
          <Button type="button" variant="ghost" onClick={sair}>
            Sair
          </Button>
        </div>
      </div>
    </div>
  )
}
