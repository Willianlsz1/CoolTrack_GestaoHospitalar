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
