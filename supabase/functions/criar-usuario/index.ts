// Edge Function: criar-usuario
// ----------------------------------------------------------------------
// Cria um novo usuário do CoolTrack a partir do painel admin do app.
//
// POR QUE NO SERVIDOR: criar usuário exige `auth.admin.createUser`, que só
// funciona com a service/secret key — a chave-mestra que IGNORA o RLS. Ela
// nunca pode ir para o frontend (ficaria exposta no bundle). Aqui ela vive
// como variável de ambiente, injetada pelo Supabase.
//
// SEGURANÇA: usamos a service key para (a) validar o token de QUEM chamou e
// (b) conferir na tabela perfis que ele é admin. Só então criamos o usuário.
// Assim a função depende de UMA chave só (sem a anon, marcada deprecated).
//
// Deploy: Supabase → Edge Functions → criar `criar-usuario` → colar este
// código → Deploy. `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` já vêm no
// ambiente. Se um dia a service_role sumir, basta criar um segredo
// `CT_SERVICE_ROLE_KEY` (aba Secrets) com uma secret key do projeto.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

// Service key (acesso total, server-side). Preferimos o segredo explícito
// CT_SERVICE_ROLE_KEY — no sistema novo de chaves, a env legada
// SUPABASE_SERVICE_ROLE_KEY pode ter sido rebaixada e não funcionar como
// service_role. Ela fica só como fallback. (Nomes SUPABASE_ são reservados,
// por isso o segredo manual usa o prefixo CT_.)
function getServiceKey(): string {
  return (
    Deno.env.get('CT_SERVICE_ROLE_KEY') ??
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
    ''
  )
}

Deno.serve(async (req) => {
  // Preflight do navegador.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Método não permitido.' }, 405)
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Sem autenticação.' }, 401)

    const url = Deno.env.get('SUPABASE_URL')!
    const serviceKey = getServiceKey()
    if (!serviceKey) {
      return json({ error: 'Configuração ausente: service key.' }, 500)
    }

    // 1) Checa admin NO CONTEXTO DO CHAMADOR: apikey = secret (passa o
    //    gateway) + Authorization = JWT do chamador (o PostgREST identifica o
    //    usuário). is_admin() é security definer: lê perfis por dentro, sem
    //    exigir permissão direta na tabela.
    const chamador = createClient(url, serviceKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: ehAdmin, error: adminErr } = await chamador.rpc('is_admin')
    if (adminErr) return json({ error: adminErr.message }, 500)
    if (!ehAdmin) {
      return json(
        { error: 'Apenas administradores podem criar usuários.' },
        403,
      )
    }

    // 2) Validação do corpo.
    const body = await req.json().catch(() => ({}))
    const nome = typeof body.nome === 'string' ? body.nome.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const senha = typeof body.senha === 'string' ? body.senha : ''

    if (!nome) return json({ error: 'Informe o nome.' }, 400)
    if (!EMAIL_RE.test(email)) return json({ error: 'E-mail inválido.' }, 400)
    if (senha.length < 6) {
      return json({ error: 'A senha deve ter ao menos 6 caracteres.' }, 400)
    }

    // 3) Cria o usuário com a secret key (a API de admin do GoTrue aceita
    //    sb_secret). email_confirm:true o deixa já apto a entrar com a senha
    //    definida. O trigger handle_new_user cria o perfil (técnico).
    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false },
    })
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { nome },
    })
    if (error) return json({ error: error.message }, 400)

    return json({ id: data.user?.id }, 200)
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500)
  }
})
