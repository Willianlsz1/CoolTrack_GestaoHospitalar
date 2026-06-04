import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// DEV apenas: expõe o cliente no console (window.supabase) para o pentest
// manual descrito no SECURITY.md. Em produção `import.meta.env.DEV` é false,
// então esta linha some do build.
if (import.meta.env.DEV) {
  window.supabase = supabase
}
