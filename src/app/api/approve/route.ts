import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gybbjalhfvwditihhlcf.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5YmJqYWxoZnZ3ZGl0aWhobGNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjUyMjUyNSwiZXhwIjoyMTA4MDk4NTI1fQ.VgtUw5UJaIJrqlGWmc-3XXE-8ItS1KyvilZwW1vDszg'
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const action = searchParams.get('action') || 'approve';

  if (!id) {
    return new NextResponse('ID do usuário não fornecido.', { status: 400 });
  }

  try {
    // 1. Busca perfil
    const { data: profile, error: fetchErr } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !profile) {
      return new NextResponse(
        renderHtmlResponse(
          'Usuário não encontrado',
          'Não encontramos o cadastro deste membro ou ele já foi excluído.',
          false
        ),
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    const newStatus = action === 'reject' ? 'rejected' : 'approved';

    // 2. Atualiza no banco
    const { error: updateErr } = await supabaseAdmin
      .from('profiles')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateErr) {
      return new NextResponse(
        renderHtmlResponse(
          'Erro ao processar',
          'Ocorreu uma falha ao atualizar o status no banco de dados: ' + updateErr.message,
          false
        ),
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    const roleLabel = profile.role === 'lider_time' ? 'Líder de Time' : profile.role === 'lider_base' ? 'Líder Base' : 'Voluntário';

    if (newStatus === 'approved') {
      return new NextResponse(
        renderHtmlResponse(
          '✅ Acesso Aprovado com Sucesso!',
          `O acesso de <strong>${profile.full_name}</strong> como <strong>${roleLabel}</strong> (${profile.team || 'Liderança'}) foi liberado! Ele(a) já pode entrar no sistema utilizando seu <strong>Nome e Senha</strong>.`,
          true,
          profile.full_name
        ),
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    } else {
      return new NextResponse(
        renderHtmlResponse(
          'Acesso Recusado',
          `A solicitação de acesso de <strong>${profile.full_name}</strong> foi recusada.`,
          false,
          profile.full_name
        ),
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }
  } catch (err: any) {
    return new NextResponse(
      renderHtmlResponse('Erro no servidor', err.message || 'Erro inesperado.', false),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

function renderHtmlResponse(title: string, message: string, isSuccess: boolean, userName?: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Hangout</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#071324] text-white min-h-screen flex items-center justify-center p-4 font-sans">
  <div class="max-w-md w-full rounded-3xl bg-white/5 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-center">
    <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
      isSuccess ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
    }">
      ${isSuccess ? '✓' : '✕'}
    </div>

    <h1 class="mt-4 text-xl sm:text-2xl font-black text-white">${title}</h1>
    <p class="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">${message}</p>

    <div class="mt-6 pt-4 border-t border-white/10 flex flex-col gap-2">
      <a href="https://hangoutt-pink.vercel.app/" class="rounded-2xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all">
        Ir para o Painel Hangout
      </a>
      <p class="text-[10px] text-slate-500 mt-2">Hangout Ministry • Gestão Oficial</p>
    </div>
  </div>
</body>
</html>`;
}
