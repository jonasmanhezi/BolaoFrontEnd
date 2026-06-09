const ENCODING_PREFIX = 'b64:';

export function encodeCredential(value: string): string {
  return ENCODING_PREFIX + btoa(value);
}

export function decodeCredential(encoded: string): string {
  if (!encoded.startsWith(ENCODING_PREFIX)) {
    throw new Error('Formato de credencial inválido');
  }
  const raw = encoded.slice(ENCODING_PREFIX.length);
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(raw, 'base64').toString('utf-8');
  }
  return atob(raw);
}