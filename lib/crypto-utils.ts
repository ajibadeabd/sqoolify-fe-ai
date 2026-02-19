function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s)
}

function fromBase64(s: string): Uint8Array {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
}

async function getAesKey(slug: string, usage: KeyUsage[]): Promise<CryptoKey> {
  const keyBytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(slug))
  return crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, usage)
}

export async function encryptAuth(payload: object, slug: string): Promise<string> {
  const key = await getAesKey(slug, ['encrypt'])
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const data = new TextEncoder().encode(JSON.stringify(payload))
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)
  const combined = new Uint8Array(12 + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), 12)
  return toBase64(combined.buffer)
}

export async function decryptAuth<T>(encrypted: string, slug: string): Promise<T> {
  const key = await getAesKey(slug, ['decrypt'])
  const combined = fromBase64(encrypted)
  const iv = combined.slice(0, 12)
  const data = combined.slice(12)
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
  return JSON.parse(new TextDecoder().decode(decrypted)) as T
}
