/**
 * Webhook Security Utilities
 * Provides signature verification for webhook endpoints
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { logger } from './logger';

/**
 * Verify GitHub webhook signature using HMAC-SHA256
 * @param payload - Raw webhook payload string
 * @param signature - Signature from x-hub-signature-256 header
 * @param secret - Webhook secret from environment
 * @returns true if signature is valid, false otherwise
 */
export function verifyGitHubSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    logger.warn('Missing signature header');
    return false;
  }

  if (!secret) {
    logger.error('GitHub webhook secret not configured');
    return false;
  }

  try {
    const hash = createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    const expectedSignature = `sha256=${hash}`;

    // Use timingSafeEqual to prevent timing attacks
    const isValid = timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      logger.warn('Signature mismatch', {
        expected: expectedSignature.substring(0, 15) + '...',
        received: signature.substring(0, 15) + '...',
      });
    }

    return isValid;
  } catch (error) {
    logger.error('Signature verification error', error);
    return false;
  }
}

/**
 * Hash IP address for privacy-conscious storage
 * @param ip - IP address to hash
 * @returns SHA-256 hash of IP address
 */
export function hashIP(ip: string | null): string | null {
  if (!ip) return null;

  return createHmac('sha256', process.env.IP_HASH_SALT || 'default-salt')
    .update(ip)
    .digest('hex');
}
