import { supabase } from './supabase'

// Helper único de fotos. Equipamentos e manutenções usam o MESMO bucket
// público (decisão: sem bucket novo), então a lógica de upload/remoção
// fica num só lugar.
const BUCKET = 'equipamentos'

// Sobe um arquivo e devolve a URL pública. Nome com crypto.randomUUID()
// para nunca sobrescrever outra foto.
export async function enviarFoto(file) {
  // Se o arquivo não tem extensão (ex.: blob de câmera "image"), cai em jpg.
  const partes = file.name.split('.')
  const extensao = partes.length > 1 ? partes.pop() : 'jpg'
  const caminho = `${crypto.randomUUID()}.${extensao}`

  const { error } = await supabase.storage.from(BUCKET).upload(caminho, file)
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(caminho)
  return data.publicUrl
}

// Apaga o arquivo apontado por uma URL pública. Quem chama decide engolir
// o erro (limpeza de órfã é best-effort).
export async function removerFotoPorUrl(fotoUrl) {
  if (!fotoUrl) return

  const caminho = fotoUrl.split(`/${BUCKET}/`).pop()
  if (!caminho) return

  const { error } = await supabase.storage.from(BUCKET).remove([caminho])
  if (error) throw error
}
