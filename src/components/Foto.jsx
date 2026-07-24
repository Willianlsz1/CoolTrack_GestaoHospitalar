import { useQuery } from '@tanstack/react-query'
import { assinarFoto, caminhoDaFoto } from '../core/storage'

// Foto do Storage privado. O banco guarda o caminho do arquivo; a URL de
// leitura é assinada sob demanda e vale 1h (ver core/storage.js).
//
// Por que passa pelo react-query: a assinatura é uma chamada de rede por
// foto. Sem cache, a lista de equipamentos assinaria a mesma foto de novo a
// cada render/rolagem. A chave é o caminho, então duas telas que mostram o
// mesmo equipamento compartilham a assinatura.
//
// staleTime de 30min < 1h de validade: renova com folga, nunca serve uma URL
// que já expirou.
const MEIA_HORA = 30 * 60 * 1000

export function Foto({ src, alt, className, style, ...resto }) {
  const caminho = caminhoDaFoto(src)

  const { data: url } = useQuery({
    queryKey: ['foto', caminho],
    queryFn: () => assinarFoto(caminho),
    enabled: !!caminho,
    staleTime: MEIA_HORA,
  })

  // Enquanto a assinatura não chega (ou se falhou), ocupa o MESMO espaço com
  // uma caixa vazia: sem ícone de imagem quebrada e sem pulo de layout.
  if (!url) {
    return (
      <div
        className={className}
        style={{ background: 'var(--surface-2)', ...style }}
        aria-hidden="true"
      />
    )
  }

  return (
    <img src={url} alt={alt} className={className} style={style} {...resto} />
  )
}
