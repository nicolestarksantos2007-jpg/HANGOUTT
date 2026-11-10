import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gybbjalhfvwditihhlcf.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5YmJqYWxoZnZ3ZGl0aWhobGNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjUyMjUyNSwiZXhwIjoyMTA4MDk4NTI1fQ.VgtUw5UJaIJrqlGWmc-3XXE-8ItS1KyvilZwW1vDszg'
);

// Validador: somente Líder Base pode gerenciar ou excluir usuários
async function verifyBaseLeader(userId: string): Promise<boolean> {
  if (!userId) return false;
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role, email')
    .eq('id', userId)
    .single();

  if (!profile) return false;
  return (
    profile.role === 'lider_base' || 
    profile.email === 'eduardopiccinimartins@gmail.com' ||
    profile.email === 'nicolestarksantos2007@gmail.com'
  );
}

// 1. DELETE: Remover voluntário ou líder de time
export async function DELETE(req: NextRequest) {
  try {
    const { profileId, currentUserId } = await req.json();

    if (!profileId || !currentUserId) {
      return NextResponse.json({ error: 'IDs de perfil e autorização são obrigatórios.' }, { status: 400 });
    }

    const isAuthorized = await verifyBaseLeader(currentUserId);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Acesso negado: apenas Líderes Base podem remover membros.' }, { status: 403 });
    }

    // Não permite excluir a si mesmo
    if (profileId === currentUserId) {
      return NextResponse.json({ error: 'Você não pode excluir sua própria conta de Líder Base.' }, { status: 400 });
    }

    // Busca perfil a ser removido
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role, email')
      .eq('id', profileId)
      .single();

    if (!targetProfile) {
      return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 });
    }

    // 1. Remove de public.volunteers
    await supabaseAdmin
      .from('volunteers')
      .delete()
      .or(`profile_id.eq.${profileId},full_name.eq."${targetProfile.full_name}"`);

    // 2. Remove de public.profiles
    const { error: profileDelErr } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', profileId);

    if (profileDelErr) {
      console.error('Erro ao deletar perfil:', profileDelErr);
    }

    // 3. Remove de auth.users
    try {
      await supabaseAdmin.auth.admin.deleteUser(profileId);
    } catch (authDelErr) {
      console.warn('Nota ao deletar auth user:', authDelErr);
    }

    return NextResponse.json({
      success: true,
      message: `Usuário ${targetProfile.full_name} removido com sucesso do sistema.`
    });
  } catch (err: any) {
    console.error('Erro ao excluir usuário:', err);
    return NextResponse.json({ error: err.message || 'Erro inesperado ao excluir usuário.' }, { status: 500 });
  }
}

// 2. PATCH: Atualizar time, desvincular de time ou alterar papel
export async function PATCH(req: NextRequest) {
  try {
    const { profileId, currentUserId, updates } = await req.json();

    if (!profileId || !currentUserId || !updates) {
      return NextResponse.json({ error: 'Parâmetros incompletos.' }, { status: 400 });
    }

    const isAuthorized = await verifyBaseLeader(currentUserId);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Acesso negado: apenas Líderes Base podem gerenciar membros.' }, { status: 403 });
    }

    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, team, role')
      .eq('id', profileId)
      .single();

    if (!targetProfile) {
      return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 });
    }

    // Atualiza profiles
    const payload: any = {
      updated_at: new Date().toISOString()
    };
    if (updates.team !== undefined) payload.team = updates.team;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.status !== undefined) payload.status = updates.status;

    const { data: updatedProfile, error: updateErr } = await supabaseAdmin
      .from('profiles')
      .update(payload)
      .eq('id', profileId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 400 });
    }

    // Se alterou time, sincroniza em public.volunteers
    if (updates.team !== undefined) {
      await supabaseAdmin
        .from('volunteers')
        .update({ team: updates.team })
        .or(`profile_id.eq.${profileId},full_name.eq."${targetProfile.full_name}"`);
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: `Perfil de ${targetProfile.full_name} atualizado com sucesso.`
    });
  } catch (err: any) {
    console.error('Erro ao atualizar membro:', err);
    return NextResponse.json({ error: err.message || 'Erro inesperado.' }, { status: 500 });
  }
}
