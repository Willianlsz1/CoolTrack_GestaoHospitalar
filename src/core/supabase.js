import { createClient } from '@supabase/supabase-js'
import { modoDemoAtivo, DEMO_URL, DEMO_KEY } from './demoConfig'

// No modo visitante o app inteiro aponta para o projeto demo (dados
// fictícios). A sessão de cada projeto vive numa chave própria do
// localStorage (o Supabase inclui o ref do projeto no nome), então entrar
// e sair do modo demo não mistura as sessões.
const demo = modoDemoAtivo()
const supabaseUrl = demo ? DEMO_URL : import.meta.env.VITE_SUPABASE_URL
const supabaseKey = demo
  ? DEMO_KEY
  : import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// DEV apenas: expõe o cliente no console (window.supabase) para o pentest
// manual descrito no SECURITY.md. Em produção `import.meta.env.DEV` é false,
// então esta linha some do build.
if (import.meta.env.DEV) {
  window.supabase = supabase
}
