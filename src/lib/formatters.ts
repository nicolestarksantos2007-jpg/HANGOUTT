export function formatMoney(v: number | string | undefined | null): string {
  const n = Number(v) || 0;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatMoneySigned(v: number | string | undefined | null): string {
  const n = Number(v) || 0;
  return (n < 0 ? '-' : '') + Math.abs(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(d: string | undefined | null): string {
  if (!d) return '—';
  const parts = d.split('-');
  if (parts.length === 3) {
    const [y, m, day] = parts;
    return `${day}/${m}/${y}`;
  }
  return d;
}

export function isCreditCardPayment(method?: string | null): boolean {
  if (!method) return false;
  const m = method.toLowerCase().trim();
  return (
    m === 'crédito' ||
    m === 'credito' ||
    m === 'cartão de crédito' ||
    m === 'cartao de credito' ||
    m.includes('crédito') ||
    m.includes('credito')
  );
}
