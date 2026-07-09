/** Utilidades de máscara/normalização de entrada (telefone BR, etc.). */

/** Só os dígitos de uma string (remove (), -, espaços, +...). */
export const digitsOnly = (v?: string | null): string => (v ?? '').replace(/\D/g, '');

/**
 * Máscara de telefone brasileiro conforme o usuário digita:
 *  - 10 dígitos (fixo):   (00) 0000-0000
 *  - 11 dígitos (celular): (00) 00000-0000
 * Corta em 11 dígitos. Segura para chamar em cada onChangeText (idempotente).
 */
export function maskPhoneBR(value?: string | null): string {
  const d = digitsOnly(value).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Telefone BR válido = 10 (fixo) ou 11 (celular) dígitos. */
export const isValidPhoneBR = (value?: string | null): boolean => {
  const d = digitsOnly(value);
  return d.length === 10 || d.length === 11;
};
