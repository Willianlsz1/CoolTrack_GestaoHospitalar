// Rótulo da ação de uma linha do log de aprovações, a partir do status novo:
//  - aprovado  -> "Aprovado"
//  - reprovado -> "Reprovado"
//  - pendente  -> "Reaberto" (a decisão foi desfeita, voltou para a fila)
export function rotuloDecisao(status) {
  switch (status) {
    case 'aprovado':
      return 'Aprovado'
    case 'reprovado':
      return 'Reprovado'
    case 'pendente':
      return 'Reaberto'
    default:
      return status ?? '—'
  }
}
