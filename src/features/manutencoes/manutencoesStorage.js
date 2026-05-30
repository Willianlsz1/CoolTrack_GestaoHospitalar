import { supabase } from '../../core/supabase'

// Reaproveita o bucket público dos equipamentos (decisão: sem bucket
// novo). Espelha o equipamentosStorage; um helper genérico unificado é
// uma simplificação possível no futuro.
const BUCKET = 'equipamentos'

export async function enviarFotoManutencao(file) {
  const extensao = file.name.split('.').pop()
  const caminho = `${crypto.randomUUID()}.${extensao}`

  const { error } = await supabase.storage.from(BUCKET).upload(caminho, file)
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(caminho)
  return data.publicUrl
}

// Best-effort: quem chama decide engolir o erro (limpeza de órfã).
export async function removerFotoManutencaoPorUrl(fotoUrl) {
  if (!fotoUrl) return

  const caminho = fotoUrl.split(`/${BUCKET}/`).pop()
  if (!caminho) return

  const { error } = await supabase.storage.from(BUCKET).remove([caminho])
  if (error) throw error
}
