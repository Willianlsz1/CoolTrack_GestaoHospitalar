import { supabase } from './supabase'

// Helper único de fotos. Equipamentos e manutenções usam o MESMO bucket
// (decisão: sem bucket novo), então a lógica fica num só lugar.
//
// O bucket é PRIVADO (migração 0028): não existe URL que funcione sem login.
// Por isso o banco guarda o CAMINHO do arquivo, não uma URL — a URL é gerada
// na hora de exibir, assinada e com validade curta (ver assinarFoto).
const BUCKET = 'equipamentos'

// Validade da URL assinada. 1h é folgado para a navegação de uma sessão e
// curto o bastante para um link vazado não virar acesso permanente.
const VALIDADE_SEGUNDOS = 3600

// Sobe um arquivo e devolve o CAMINHO dentro do bucket. Nome com
// crypto.randomUUID() para nunca sobrescrever outra foto.
export async function enviarFoto(file) {
  // Se o arquivo não tem extensão (ex.: blob de câmera "image"), cai em jpg.
  const partes = file.name.split('.')
  const extensao = partes.length > 1 ? partes.pop() : 'jpg'
  const caminho = `${crypto.randomUUID()}.${extensao}`

  const { error } = await supabase.storage.from(BUCKET).upload(caminho, file)
  if (error) throw error

  return caminho
}

// Normaliza para um caminho o valor guardado no banco.
//
// Por que tolerar dois formatos: as linhas criadas ANTES da 0028 guardam a
// URL pública inteira (".../object/public/equipamentos/uuid.jpg"). Migrar
// essas linhas seria trabalho de dados para ganho nenhum — o caminho já está
// lá dentro, basta cortar. Linhas novas guardam só o caminho.
export function caminhoDaFoto(valor) {
  if (!valor) return null
  const marcador = `/${BUCKET}/`
  return valor.includes(marcador) ? valor.split(marcador).pop() : valor
}

// Gera a URL temporária de leitura. Sem isto o <img> não carrega nada:
// bucket privado não responde a URL pública. Recebe um caminho JÁ normalizado
// (quem chama passa por caminhoDaFoto antes — ver components/Foto.jsx).
export async function assinarFoto(caminho) {
  if (!caminho) return null

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(caminho, VALIDADE_SEGUNDOS)
  if (error) throw error
  return data.signedUrl
}

// Apaga o arquivo. Quem chama decide engolir o erro (limpeza de órfã é
// best-effort). Só admin passa pela política do Storage (0028) — para o
// técnico isto falha em silêncio, e é o comportamento desejado: foto é
// evidência, não some porque alguém mexeu num cadastro.
export async function removerFoto(valor) {
  const caminho = caminhoDaFoto(valor)
  if (!caminho) return

  const { error } = await supabase.storage.from(BUCKET).remove([caminho])
  if (error) throw error
}
