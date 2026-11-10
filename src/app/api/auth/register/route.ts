import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gybbjalhfvwditihhlcf.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5YmJqYWxoZnZ3ZGl0aWhobGNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjUyMjUyNSwiZXhwIjoyMTA4MDk4NTI1fQ.VgtUw5UJaIJrqlGWmc-3XXE-8ItS1KyvilZwW1vDszg'
);

function generateInternalEmail(fullName: string): string {
  const clean = fullName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
  return `${clean || 'membro'}@hangout.local`;
}

export async function POST(req: NextRequest) {
  try {
    const { fullName, password, role, team, email } = await req.json();

    if (!fullName || !password) {
      return NextResponse.json({ error: 'Nome e senha são obrigatórios.' }, { status: 400 });
    }

    const trimmedName = fullName.trim();
    const cleanEmail = email?.trim().toLowerCase() || generateInternalEmail(trimmedName);
    const chosenTeam = role === 'lider_base' ? 'Liderança Base' : (team || 'Time 1');

    // Regra de Acesso:
    // 1. Voluntários: acesso liberado já (status = 'approved')
    // 2. Líderes Base pré-autorizados (Eduardo Piccini e Nicole stark): liberado já (status = 'approved')
    // 3. Líderes de Time ou outros Líderes Base: requer aprovação de Eduardo (status = 'pending')
    const isPreApproved = 
      role === 'volunteer' ||
      cleanEmail === 'eduardopiccinimartins@gmail.com' ||
      cleanEmail === 'nicolestarksantos2007@gmail.com' ||
      trimmedName.toLowerCase() === 'eduardo piccini' ||
      trimmedName.toLowerCase() === 'nicole stark';

    const status = isPreApproved ? 'approved' : 'pending';

    // 1. Cria usuário autenticado no Supabase com email_confirm: true para liberar login imediato
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: trimmedName,
        role,
        team: chosenTeam,
        status
      }
    });

    let userId = authData?.user?.id;

    if (authError) {
      // Se já existe no auth, tenta buscar o perfil existente para atualizar senha/perfil
      if (authError.message.toLowerCase().includes('already') || authError.message.toLowerCase().includes('registered')) {
        const { data: existingProfiles } = await supabaseAdmin
          .from('profiles')
          .select('id, email')
          .ilike('full_name', trimmedName)
          .limit(1);

        if (existingProfiles && existingProfiles.length > 0 && existingProfiles[0].id) {
          const targetId = existingProfiles[0].id;
          userId = targetId;
          // Atualiza a senha no auth
          await supabaseAdmin.auth.admin.updateUserById(targetId, {
            password,
            user_metadata: { full_name: trimmedName, role, team: chosenTeam, status }
          });
        } else {
          return NextResponse.json({ 
            error: 'Este nome já está cadastrado no sistema. Por favor, tente entrar ou escolha outro nome.' 
          }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Falha ao gerar identificador de usuário.' }, { status: 500 });
    }

    // 2. Grava ou atualiza em public.profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        full_name: trimmedName,
        email: cleanEmail,
        role,
        team: chosenTeam,
        status,
        is_active: true,
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Erro ao gravar perfil:', profileError);
    }

    // 3. Se for voluntário, registra também na tabela de voluntários do Hangout
    if (role === 'volunteer') {
      try {
        await supabaseAdmin.from('volunteers').upsert({
          full_name: trimmedName,
          email: cleanEmail,
          team: chosenTeam,
          status: 'active',
          profile_id: userId,
          created_at: new Date().toISOString()
        }, { onConflict: 'full_name' });
      } catch (volErr) {
        console.warn('Nota: Voluntário já indexado ou erro leve:', volErr);
      }
    }

    // 4. Se for Líder de Time ou Líder Base não aprovado de antemão:
    // Dispara notificação por e-mail para Eduardo Piccini (eduardopiccinimartins@gmail.com)
    if (status === 'pending') {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hangoutt-pink.vercel.app';
        await fetch(`${baseUrl}/api/notify-approval`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileId: userId,
            fullName: trimmedName,
            role,
            team: chosenTeam
          })
        });
      } catch (notifyErr) {
        console.warn('Erro ao chamar notify-approval:', notifyErr);
      }
    }

    return NextResponse.json({
      success: true,
      userId,
      email: cleanEmail,
      fullName: trimmedName,
      role,
      team: chosenTeam,
      status,
      message: status === 'approved'
        ? 'Acesso liberado com sucesso! Entrando no sistema...'
        : 'Cadastro enviado com sucesso! Uma notificação de aprovação foi enviada para o e-mail do Líder Base (Eduardo Piccini). Assim que aprovado, seu acesso com nome e senha estará ativo.'
    });

  } catch (err: any) {
    console.error('Erro no cadastro:', err);
    return NextResponse.json({ error: err.message || 'Erro inesperado no servidor.' }, { status: 500 });
  }
}
