import crypto from 'crypto';

const IV_LENGTH = 16;
const V1_PREFIX = 'enc:v1:';

function getEncryptionKey(): Buffer {
  const hex = process.env.MESSAGE_ENCRYPTION_KEY?.trim();
  if (!hex) {
    throw new Error(
      'MESSAGE_ENCRYPTION_KEY is not set (64 hex chars = 32 bytes). Generate: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error('MESSAGE_ENCRYPTION_KEY must be 64 hexadecimal characters (32 bytes)');
  }
  return Buffer.from(hex, 'hex');
}

/** Encrypt message body for storage (AES-256-CBC). */
export function encryptMessageForStorage(plain: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return V1_PREFIX + iv.toString('hex') + ':' + encrypted.toString('hex');
}

/** Decrypt stored message for API/clients; legacy rows without prefix returned as-is. */
export function decryptMessageFromStorage(stored: string): string {
  if (!stored.startsWith(V1_PREFIX)) {
    return stored;
  }
  const key = getEncryptionKey();
  const payload = stored.slice(V1_PREFIX.length);
  const colon = payload.indexOf(':');
  if (colon <= 0) {
    return stored;
  }
  const ivHex = payload.slice(0, colon);
  const encHex = payload.slice(colon + 1);
  try {
    const iv = Buffer.from(ivHex, 'hex');
    const enc = Buffer.from(encHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
  } catch {
    return stored;
  }
}
