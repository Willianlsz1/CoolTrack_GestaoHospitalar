// Filtra equipamentos por um termo livre, casando em nome, patrimônio ou
// série (case-insensitive). Usado na busca manual do Escanear (fallback
// quando a câmera não está disponível ou o QR está danificado).
// Termo vazio devolve lista vazia — a busca só mostra algo quando o usuário
// digita, em vez de despejar o inventário inteiro.
export function filtrarEquipamentosPorTermo(equipamentos, termo) {
  const t = (termo ?? '').trim().toLowerCase()
  if (!t) return []
  return equipamentos.filter((eq) =>
    `${eq.nome ?? ''} ${eq.patrimonio ?? ''} ${eq.serie ?? ''}`
      .toLowerCase()
      .includes(t),
  )
}
