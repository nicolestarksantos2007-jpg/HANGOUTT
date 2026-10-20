export interface WhatsAppRecipient {
  name: string;
  phone: string; // E.164 format: +5551985363626
  rawDisplay: string;
}

// Configuração centralizada dos destinatários de alertas do WhatsApp
export const WHATSAPP_RECIPIENTS: WhatsAppRecipient[] = [
  {
    name: 'WhatsApp 1',
    phone: '+5551985363626',
    rawDisplay: '+55 51 98536-3626',
  },
  {
    name: 'WhatsApp 2',
    phone: '+5551996662954',
    rawDisplay: '+55 51 99666-2954',
  },
];

export type AlertTier = '80' | '100' | 'overflow';

export function formatLimitAlertMessage({
  category,
  limit,
  spent,
  percentage,
  remaining,
  monthName,
  year,
  tier,
}: {
  category: string;
  limit: number;
  spent: number;
  percentage: number;
  remaining: number;
  monthName: string;
  year: number;
  tier: AlertTier;
}): string {
  const tierTitles: Record<AlertTier, string> = {
    '80': '⚠️ ALERTA FINANCEIRO: 80% do Limite Atingido!',
    '100': '🛑 ALERTA FINANCEIRO: 100% do Limite Atingido!',
    'overflow': '🚨 ALERTA FINANCEIRO: Limite Mensal Ultrapassado (>100%)!',
  };

  const statusTitle = tierTitles[tier] || '⚠️ ALERTA FINANCEIRO DE LIMITE';
  const formattedSpent = spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formattedLimit = limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formattedRemaining = remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return `*${statusTitle}*

📊 *Categoria:* ${category}
📅 *Mês de Referência:* ${monthName}/${year}

💰 *Total Gasto no Mês:* ${formattedSpent}
🎯 *Limite Mensal:* ${formattedLimit}
📈 *Percentual Utilizado:* ${percentage.toFixed(1)}%
${
  remaining >= 0
    ? `💵 *Saldo Restante Disponível:* ${formattedRemaining}`
    : `🔴 *Valor Excedido:* ${Math.abs(remaining).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
}

_Notificação automática do Painel Financeiro Pessoal_`;
}
