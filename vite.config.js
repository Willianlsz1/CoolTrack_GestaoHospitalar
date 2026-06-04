import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Content-Security-Policy: lista de onde o navegador PODE carregar cada coisa.
// O ganho real é `script-src 'self'` (sem unsafe-inline/eval) — fecha o vetor
// de XSS (executar script injetado). `unsafe-inline` fica só no style-src,
// porque o app usa muito style={{}} no JSX (injeção de estilo é risco baixo).
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "script-src 'self'",
  // estilos inline (style={{}}) + a folha de estilo do Google Fonts
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // fotos no storage do Supabase; data:/blob: dos ícones e do scan por arquivo
  "img-src 'self' data: blob: https://*.supabase.co",
  // REST + realtime (websocket) do Supabase
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "form-action 'self'",
].join('; ')

// Injeta o CSP como <meta> só no build de produção. Em dev o Vite usa scripts
// inline e websocket (HMR), que um CSP rígido quebraria — por isso apply:build.
// Nota: frame-ancestors (anti-clickjacking) é ignorado em <meta>; só vale como
// header HTTP de verdade (mover para o host quando houver um).
function cspMeta() {
  return {
    name: 'csp-meta',
    apply: 'build',
    transformIndexHtml(html) {
      const tag = `<meta http-equiv="Content-Security-Policy" content="${CSP}" />`
      return html.replace('</head>', `  ${tag}\n  </head>`)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), cspMeta()],
})
