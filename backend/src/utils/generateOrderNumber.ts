import crypto from 'crypto';

/**
 * Generates a unique, human-readable order number.
 * Format: VE-YYYYMMDD-XXXXXXXX (e.g. VE-20240615-A3F2B891)
 *
 * The hex suffix is derived from a cryptographically-random 4-byte buffer
 * so collisions are extremely unlikely even under high concurrency.
 */
export function generateOrderNumber(): string {
  const now    = new Date();
  const year   = now.getFullYear();
  const month  = String(now.getMonth() + 1).padStart(2, '0');
  const day    = String(now.getDate()).padStart(2, '0');
  const date   = `${year}${month}${day}`;
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();

  return `VE-${date}-${suffix}`;
}
