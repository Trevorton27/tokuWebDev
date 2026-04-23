/**
 * Encryption utilities for sensitive data (webhook tokens, etc.)
 * Uses AES-256-GCM for encryption
 */

import crypto from 'crypto';

// Algorithm configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // AES block size
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Get encryption key from environment
 * Derives a key from the secret using PBKDF2
 */
function getEncryptionKey(salt: Buffer): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;

  if (!secret) {
    throw new Error('ENCRYPTION_SECRET environment variable is not set');
  }

  return crypto.pbkdf2Sync(secret, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

/**
 * Encrypt a string value
 * @param text - Plain text to encrypt
 * @returns Encrypted string (base64 encoded with IV, salt, and auth tag)
 */
export function encrypt(text: string): string {
  try {
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    // Derive key from secret
    const key = getEncryptionKey(salt);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get the auth tag
    const authTag = cipher.getAuthTag();

    // Combine salt + iv + authTag + encrypted data
    const combined = Buffer.concat([
      salt,
      iv,
      authTag,
      Buffer.from(encrypted, 'hex'),
    ]);

    // Return as base64
    return combined.toString('base64');
  } catch (error) {
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt an encrypted string
 * @param encryptedData - Base64 encoded encrypted data
 * @returns Decrypted plain text
 */
export function decrypt(encryptedData: string): string {
  try {
    // Decode from base64
    const combined = Buffer.from(encryptedData, 'base64');

    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = combined.subarray(
      SALT_LENGTH + IV_LENGTH,
      SALT_LENGTH + IV_LENGTH + TAG_LENGTH
    );
    const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    // Derive key from secret
    const key = getEncryptionKey(salt);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt the data
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error('Decryption failed');
  }
}

/**
 * Generate a random webhook token
 * @param length - Length of the token (default 32)
 * @returns Random hex string
 */
export function generateWebhookToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Verify if a string is a valid encrypted value
 * @param value - Value to check
 * @returns True if valid encrypted format
 */
export function isEncrypted(value: string): boolean {
  try {
    const combined = Buffer.from(value, 'base64');
    const expectedMinLength = SALT_LENGTH + IV_LENGTH + TAG_LENGTH;
    return combined.length > expectedMinLength;
  } catch {
    return false;
  }
}
