import { supabase } from '../../core/supabase'

const BUCKET = 'equipamentos'

// Sobe um arquivo de foto para o Storage e devolve a URL pública.
// O nome do arquivo usa crypto.randomUUID() para nunca sobrescrever
// outra foto. Por ser bucket público, a URL é estável e vai direto
// no <img src>.
export async function enviarFotoEquipamento(file) {
  const extensao = file.name.split('.').pop()
  const caminho = `${crypto.randomUUID()}.${extensao}`

  const { error } = await supabase.storage.from(BUCKET).upload(caminho, file)
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(caminho)
  return data.publicUrl
}

// Apaga do Storage o arquivo apontado por uma URL pública. Extrai o
// caminho do que vem depois de "/<BUCKET>/". Best-effort: se algo der
// errado, lança — quem chama decide engolir (limpeza não pode quebrar
// a ação principal).
export async function removerFotoPorUrl(fotoUrl) {
  if (!fotoUrl) return

  const caminho = fotoUrl.split(`/${BUCKET}/`).pop()
  if (!caminho) return

  const { error } = await supabase.storage.from(BUCKET).remove([caminho])
  if (error) throw error
}
