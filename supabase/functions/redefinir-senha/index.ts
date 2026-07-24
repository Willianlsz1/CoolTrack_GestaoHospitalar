// Edge Function: redefinir-senha
// ----------------------------------------------------------------------
// Dá ao admin uma senha TEMPORÁRIA nova para um usuário que perdeu a sua.
//
// POR QUE EXISTE: a 0029 tornou obrigatório definir senha própria antes de
// usar o app. Sem um caminho de reset, quem esquecesse a senha ficaria
// travado para sempre — o portão viraria uma armadilha.
//
// POR QUE NO SERVIDOR: trocar a senha DE OUTRA PESSOA exige
// `auth.admin.updateUserById`, que só funciona com a service key. Ela nunca
// pode ir para o frontend. Mesma estrutura da criar-usuario, inclusive a
// checagem de admin no contexto do chamador.
//
// O DETALHE QUE IMPORTA: além de trocar a senha, a função ZERA
// `senha_trocada_em`. Sem isso, o reset devolveria ao admin uma senha que
// ele conhece e o portão da 0029 não dispararia de novo — o usuário seguiria
// operando com uma credencial compartilhada, que é exatamente o que a 0029 e
// a 0031 existem para impedir. Zerar recoloca a pessoa na tela de troca.
//
// Deploy: Supabase → Edge Functions → criar `redefinir-senha` → colar este
// código → Deploy.

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

// Mesma preferência de segredo da criar-usuario (nomes SUPABASE_ são
// reservados, por isso o segredo manual usa o prefixo CT_).
function getServiceKey(): string {
  return (
    Deno.env.get('CT_SERVICE_ROLE_KEY') ??
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
    ''
  )
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

Deno.serve(async (req) => {
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

    // 1) Só admin redefine senha dos outros. is_admin() é security definer:
    //    checa no banco, não na UI.
    const chamador = createClient(url, serviceKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: ehAdmin, error: adminErr } = await chamador.rpc('is_admin')
    if (adminErr) return json({ error: adminErr.message }, 500)
    if (!ehAdmin) {
      return json(
        { error: 'Apenas administradores podem redefinir senhas.' },
        403,
      )
    }

    // 2) Validação do corpo.
    const body = await req.json().catch(() => ({}))
    const usuarioId = typeof body.usuarioId === 'string' ? body.usuarioId : ''
    const senha = typeof body.senha === 'string' ? body.senha : ''

    if (!UUID_RE.test(usuarioId)) {
      return json({ error: 'Usuário inválido.' }, 400)
    }
    if (senha.length < 6) {
      return json({ error: 'A senha deve ter ao menos 6 caracteres.' }, 400)
    }

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false },
    })

    // 3) Zera a marca ANTES de trocar a senha. A ordem é deliberada: se o
    //    passo 4 falhar, a pessoa fica com a senha VELHA (que ela conhece) e
    //    verá a tela de troca no próximo acesso — inconveniente, seguro. Na
    //    ordem inversa, uma falha aqui deixaria a senha nova (que o admin
    //    conhece) valendo sem obrigar a troca: credencial compartilhada em
    //    silêncio, o pior dos dois lados.
    const { error: erroPerfil } = await admin
      .from('perfis')
      .update({ senha_trocada_em: null })
      .eq('id', usuarioId)
    if (erroPerfil) return json({ error: erroPerfil.message }, 500)

    // 4) A senha temporária em si.
    const { error: erroSenha } = await admin.auth.admin.updateUserById(
      usuarioId,
      { password: senha },
    )
    if (erroSenha) return json({ error: erroSenha.message }, 400)

    return json({ ok: true }, 200)
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500)
  }
})
