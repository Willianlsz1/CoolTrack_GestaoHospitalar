// Rótulos de exibição dos equipamentos. O banco guarda valores "de
// máquina" (snake_case, sem acento — estáveis para consulta); a interface
// mostra o texto bonito em português. Para exibir, use os LABELS; os
// arrays (derivados das chaves) alimentam os <select> mantendo a ordem.

export const TIPO_LABELS = {
  geladeira: 'Geladeira',
  freezer: 'Freezer',
  camara_fria: 'Câmara fria',
  ar_condicionado: 'Ar-condicionado',
  climatizador: 'Climatizador',
  outro: 'Outro',
}

export const STATUS_LABELS = {
  ativo: 'Ativo',
  manutencao: 'Em manutenção',
  inativo: 'Inativo',
}

export const TIPOS = Object.keys(TIPO_LABELS)
export const STATUS = Object.keys(STATUS_LABELS)
