import crypto from 'crypto';
import type { Request } from 'express';

/** Stable salted hash for storing / keying by client IP (privacy-preserving). */
export function hashClientIp(ip: string | undefined): string | null {
  if (!ip || ip === 'unknown') {
    return null;
  }
  const salt = process.env.IP_HASH_SALT?.trim() || 'dev-ip-hash-salt-change-me';
  return crypto.createHash('sha256').update(`${ip}:${salt}`).digest('hex').slice(0, 32);
}

export function clientIpFromRequest(req: Request): string {
  return req.ip || req.socket?.remoteAddress || 'unknown';
}
