import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private getKey(): Buffer {
    const secret = process.env.MEETING_CONFIG_ENCRYPTION_KEY;

    if (!secret || !secret.trim()) {
      throw new InternalServerErrorException(
        'Falta configurar MEETING_CONFIG_ENCRYPTION_KEY en el .env',
      );
    }

    return crypto.createHash('sha256').update(secret.trim()).digest();
  }

  encryptJson(value: any): string {
    const key = this.getKey();
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const plainText = JSON.stringify(value || {});
    const encrypted = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted.toString('base64'),
    ].join('.');
  }

  decryptJson<T = any>(encryptedValue?: string | null): T {
    if (!encryptedValue) return {} as T;

    try {
      const key = this.getKey();
      const [ivBase64, authTagBase64, encryptedBase64] =
        encryptedValue.split('.');

      if (!ivBase64 || !authTagBase64 || !encryptedBase64) {
        throw new Error('Formato cifrado inválido');
      }

      const iv = Buffer.from(ivBase64, 'base64');
      const authTag = Buffer.from(authTagBase64, 'base64');
      const encrypted = Buffer.from(encryptedBase64, 'base64');

      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return JSON.parse(decrypted.toString('utf8')) as T;
    } catch {
      throw new InternalServerErrorException(
        'No se pudieron descifrar las credenciales del proveedor.',
      );
    }
  }
}