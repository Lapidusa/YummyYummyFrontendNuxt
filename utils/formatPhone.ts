export function formatPhone(raw: string): string {
  const cleaned = raw.replace(/\D/g, '');
  if (cleaned.length !== 11 || !cleaned.startsWith('7')) return '';

  const parts = cleaned.match(/^7(\d{3})(\d{3})(\d{2})(\d{2})$/);
  if (!parts) return '';

  return `+7 (${parts[1]}) ${parts[2]}-${parts[3]}-${parts[4]}`;
}
