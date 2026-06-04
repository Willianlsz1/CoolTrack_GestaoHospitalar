// Frequências OFERECIDAS no select de modelo de checklist. Só 'mensal': a
// cadência anual ainda não é executada nem rastreada (a ficha, a ronda e a
// classificação só conhecem a mensal). Deixar 'anual' aqui faria o gestor
// criar um checklist anual que evapora — sem execução nem cobrança. O 'anual'
// continua aceito no banco (CHECK da 0019) e em FREQ_LABELS para exibir dados
// legados; reincluir aqui quando o fluxo anual existir.
export const FREQUENCIAS = ['mensal']

export const FREQ_LABELS = {
  mensal: 'Mensal',
  anual: 'Anual',
}
