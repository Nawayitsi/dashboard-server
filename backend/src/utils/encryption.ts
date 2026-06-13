import crypto from 'crypto';
import { config } from '../config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Derive a 32-byte encryption key.
 * Uses ENCRYPTION_KEY env var if set, otherwise falls back to SHA-256 of JWT_SECRET.
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;
  if (envKey && envKey.length >= 32) {
    return Buffer.from(envKey.slice(0, 32), 'utf-8');
  }
  // Fallback: derive from JWT secret
  return crypto.createHash('sha256').update(config.jwt.secret).digest();
}

/**
 * Encrypt a plaintext value using AES-256-GCM.
 * Returns a string in the format: iv:authTag:ciphertext (all hex-encoded).
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt a ciphertext value encrypted with AES-256-GCM.
 * Expects the format: iv:authTag:ciphertext (all hex-encoded).
 */
export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  const parts = encryptedText.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const ciphertext = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Encrypt a config object's sensitive fields.
 * Fields like password, apiToken, secret, token are considered sensitive.
 */
const SENSITIVE_KEYS = ['password', 'apiToken', 'secret', 'token', 'appPassword', 'botToken', 'chatId', 'webhookUrl'];

export function encryptConfig(configObj: Record<string, any>): Record<string, string> {
  const encrypted: Record<string, string> = {};
  for (const [key, value] of Object.entries(configObj)) {
    if (value === undefined || value === null || value === '') continue;
    const strValue = String(value);
    if (SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      encrypted[key] = encrypt(strValue);
    } else {
      encrypted[key] = strValue;
    }
  }
  return encrypted;
}

/**
 * Decrypt a config object's sensitive fields.
 */
export function decryptConfig(configObj: Record<string, string>): Record<string, string> {
  const decrypted: Record<string, string> = {};
  for (const [key, value] of Object.entries(configObj)) {
    if (!value) continue;
    // Check if the value looks like an encrypted string (iv:tag:cipher)
    if (value.includes(':') && value.split(':').length === 3) {
      try {
        decrypted[key] = decrypt(value);
      } catch {
        // If decryption fails, it's likely not encrypted — pass through
        decrypted[key] = value;
      }
    } else {
      decrypted[key] = value;
    }
  }
  return decrypted;
}
