import { NextRequest, NextResponse } from 'next/server';
import { WHATSAPP_RECIPIENTS, formatLimitAlertMessage, AlertTier } from '@/lib/whatsapp/config';

interface SendAlertPayload {
  category: string;
  limit: number;
  spent: number;
  percentage: number;
  remaining: number;
  monthName: string;
  year: number;
  tier: AlertTier;
}

interface RecipientResult {
  name: string;
  phone: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

// Verifica qual provedor está disponível
function detectProvider() {
  if (process.env.WHATSAPP_CLOUD_API_TOKEN && process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID) {
    return 'meta_cloud';
  }
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_NUMBER
  ) {
    return 'twilio';
  }
  if (
    process.env.EVOLUTION_API_URL &&
    process.env.EVOLUTION_API_KEY &&
    process.env.EVOLUTION_INSTANCE_NAME
  ) {
    return 'evolution_api';
  }
  if (process.env.ZAPI_INSTANCE_ID && process.env.ZAPI_TOKEN) {
    return 'zapi';
  }
  if (process.env.WHATSAPP_WEBHOOK_URL) {
    return 'webhook';
  }
  return null;
}

// Envio para um único destinatário de acordo com o provedor
async function sendToSingleRecipient(
  provider: string,
  phone: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Higieniza número (apenas dígitos)
  const cleanPhone = phone.replace(/\D/g, '');

  try {
    if (provider === 'meta_cloud') {
      const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
      const phoneId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID;
      const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body: message },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error?.message || `Erro HTTP ${res.status}` };
      }
      return { success: true, messageId: data.messages?.[0]?.id };
    }

    if (provider === 'twilio') {
      const sid = process.env.TWILIO_ACCOUNT_SID!;
      const token = process.env.TWILIO_AUTH_TOKEN!;
      const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER!;
      const auth = Buffer.from(`${sid}:${token}`).toString('base64');

      const bodyParams = new URLSearchParams();
      bodyParams.append('From', fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`);
      bodyParams.append('To', `whatsapp:${cleanPhone}`);
      bodyParams.append('Body', message);

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || `Erro Twilio ${res.status}` };
      }
      return { success: true, messageId: data.sid };
    }

    if (provider === 'evolution_api') {
      const url = process.env.EVOLUTION_API_URL!.replace(/\/+$/, '');
      const apiKey = process.env.EVOLUTION_API_KEY!;
      const instance = process.env.EVOLUTION_INSTANCE_NAME!;

      const res = await fetch(`${url}/message/sendText/${instance}`, {
        method: 'POST',
        headers: {
          apikey: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: cleanPhone,
          text: message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || data.error || `Erro Evolution API ${res.status}` };
      }
      return { success: true, messageId: data.key?.id || data.id };
    }

    if (provider === 'zapi') {
      const instanceId = process.env.ZAPI_INSTANCE_ID!;
      const token = process.env.ZAPI_TOKEN!;
      const clientToken = process.env.ZAPI_CLIENT_TOKEN || '';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (clientToken) headers['Client-Token'] = clientToken;

      const res = await fetch(`https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phone: cleanPhone,
          message: message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || data.error || `Erro Z-API ${res.status}` };
      }
      return { success: true, messageId: data.zaapId || data.messageId };
    }

    if (provider === 'webhook') {
      const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL!;
      const secret = process.env.WHATSAPP_WEBHOOK_SECRET || '';

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(secret ? { 'x-webhook-secret': secret } : {}),
        },
        body: JSON.stringify({
          recipient: cleanPhone,
          message,
          timestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        return { success: false, error: `Webhook respondeu com HTTP ${res.status}` };
      }
      return { success: true };
    }

    return { success: false, error: 'Provedor desconhecido' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erro inesperado na chamada de envio' };
  }
}

// GET: Diagnóstico da integração
export async function GET() {
  const provider = detectProvider();
  const configured = Boolean(provider);

  const missingInfo = [
    'Para ativar o envio direto e automático de mensagens no WhatsApp para os números cadastrados, configure uma das seguintes opções de provedor em variáveis de ambiente (.env.local ou Vercel):',
    '',
    '• Opção 1 (Twilio - Oficial):',
    '  - TWILIO_ACCOUNT_SID',
    '  - TWILIO_AUTH_TOKEN',
    '  - TWILIO_WHATSAPP_NUMBER (ex: whatsapp:+14155238886)',
    '',
    '• Opção 2 (Meta WhatsApp Cloud API - Oficial):',
    '  - WHATSAPP_CLOUD_API_TOKEN',
    '  - WHATSAPP_CLOUD_PHONE_NUMBER_ID',
    '',
    '• Opção 3 (Evolution API):',
    '  - EVOLUTION_API_URL',
    '  - EVOLUTION_API_KEY',
    '  - EVOLUTION_INSTANCE_NAME',
    '',
    '• Opção 4 (Z-API):',
    '  - ZAPI_INSTANCE_ID',
    '  - ZAPI_TOKEN',
    '  - ZAPI_CLIENT_TOKEN (opcional)',
    '',
    '• Opção 5 (Webhook customizado):',
    '  - WHATSAPP_WEBHOOK_URL',
    '  - WHATSAPP_WEBHOOK_SECRET (opcional)',
  ];

  return NextResponse.json({
    status: configured ? 'configured' : 'not_configured',
    configured,
    activeProvider: provider || null,
    recipients: WHATSAPP_RECIPIENTS,
    guidelines: missingInfo,
  });
}

// POST: Envio do alerta de limite para os 2 destinatários de forma independente
export async function POST(req: NextRequest) {
  try {
    const payload: SendAlertPayload = await req.json();

    if (!payload.category || payload.limit === undefined || payload.spent === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes (category, limit, spent).' },
        { status: 400 }
      );
    }

    const messageText = formatLimitAlertMessage(payload);
    const provider = detectProvider();

    // Se nenhum provedor estiver configurado nas variáveis de ambiente:
    if (!provider) {
      return NextResponse.json(
        {
          success: false,
          configured: false,
          activeProvider: null,
          message:
            'A estrutura de envio de WhatsApp está implementada, porém nenhuma credencial oficial de provedor (Twilio, Meta Cloud, Evolution API, Z-API ou Webhook) foi configurada no servidor (.env.local ou Vercel).',
          missingConfig: [
            'TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_WHATSAPP_NUMBER',
            'OU WHATSAPP_CLOUD_API_TOKEN + WHATSAPP_CLOUD_PHONE_NUMBER_ID',
            'OU EVOLUTION_API_URL + EVOLUTION_API_KEY + EVOLUTION_INSTANCE_NAME',
            'OU ZAPI_INSTANCE_ID + ZAPI_TOKEN',
            'OU WHATSAPP_WEBHOOK_URL',
          ],
          recipients: WHATSAPP_RECIPIENTS,
          formattedAlert: messageText,
        },
        { status: 200 }
      );
    }

    // Provedor configurado: envia de forma INDEPENDENTE para os dois destinatários
    // Uma falha no destinatário 1 NÃO impede a tentativa para o destinatário 2
    const results: RecipientResult[] = await Promise.all(
      WHATSAPP_RECIPIENTS.map(async (r) => {
        try {
          const res = await sendToSingleRecipient(provider, r.phone, messageText);
          return {
            name: r.name,
            phone: r.phone,
            success: res.success,
            messageId: res.messageId,
            error: res.error,
          };
        } catch (e: any) {
          return {
            name: r.name,
            phone: r.phone,
            success: false,
            error: e?.message || 'Falha ao despachar mensagem',
          };
        }
      })
    );

    const someSuccess = results.some((r) => r.success);
    const allSuccess = results.every((r) => r.success);

    return NextResponse.json({
      success: someSuccess,
      allSuccess,
      provider,
      results,
      recipientsCount: WHATSAPP_RECIPIENTS.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Erro ao processar envio do alerta' },
      { status: 500 }
    );
  }
}
