import { NextRequest, NextResponse } from 'next/server';

const BASE_LEADER_EMAIL = process.env.BASE_LEADER_EMAIL || 'eduardopiccinimartins@gmail.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://hangoutt-pink.vercel.app';

export async function POST(req: NextRequest) {
  try {
    const { profileId, fullName, role, team } = await req.json();

    if (!profileId || !fullName) {
      return NextResponse.json({ error: 'Dados incompletos para envio de notificação.' }, { status: 400 });
    }

    const roleName = role === 'lider_time' ? 'Líder de Time' : role === 'lider_base' ? 'Líder Base' : 'Voluntário';
    const approveUrl = `${APP_URL}/api/approve?id=${profileId}&action=approve`;
    const rejectUrl = `${APP_URL}/api/approve?id=${profileId}&action=reject`;

    const emailSubject = `🔔 [HANGOUT] Nova Solicitação de Acesso: ${fullName} (${roleName})`;
    const emailMessage = `
Olá Eduardo,

Uma nova pessoa se cadastrou no sistema do Hangout e aguarda sua aprovação como Líder Base:

👤 Nome: ${fullName}
🎖️ Cargo Solicitado: ${roleName}
⚡ Time: ${team || 'Não informado'}
📅 Data: ${new Date().toLocaleString('pt-BR')}

Para aprovar ou recusar imediatamente em 1 clique, use os links abaixo:

✅ APROVAR ACESSO AGORA:
${approveUrl}

❌ RECUSAR SOLICITAÇÃO:
${rejectUrl}

Ou acesse o painel de aprovações no sistema:
${APP_URL}
    `.trim();

    // Dispara via FormSubmit para o email do Eduardo
    try {
      await fetch(`https://formsubmit.co/ajax/${BASE_LEADER_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': APP_URL,
          'Referer': APP_URL
        },
        body: JSON.stringify({
          _subject: emailSubject,
          'Nome do Solicitante': fullName,
          'Cargo': roleName,
          'Time': team || 'Geral',
          'Aprovar Acesso (Clique Aqui)': approveUrl,
          'Recusar Acesso': rejectUrl,
          message: emailMessage
        })
      });
    } catch (mailErr) {
      console.warn('Erro ao disparar via FormSubmit (tentativa alternativa):', mailErr);
    }

    return NextResponse.json({
      success: true,
      message: `Notificação enviada com sucesso para ${BASE_LEADER_EMAIL}`,
      approveUrl,
      rejectUrl
    });
  } catch (err: any) {
    console.error('Erro ao notificar líder base:', err);
    return NextResponse.json({ error: err.message || 'Erro ao processar notificação.' }, { status: 500 });
  }
}
