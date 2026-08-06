// Client-Side AES-256 Encryption & Decryption using Web Crypto API

/**
 * Encrypts plain text string using AES-GCM with PBKDF2 derived key from password & salt
 */
export async function encryptData(plainText: string, masterPass: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(masterPass),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    const encryptedContent = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    // Combine salt, iv, and ciphertext into base64 payload
    const buffer = new Uint8Array(salt.byteLength + iv.byteLength + encryptedContent.byteLength);
    buffer.set(salt, 0);
    buffer.set(iv, salt.byteLength);
    buffer.set(new Uint8Array(encryptedContent), salt.byteLength + iv.byteLength);

    const base64 = btoa(String.fromCharCode(...buffer));
    return `GRAVIQ_ENC_v1:${base64}`;
  } catch (err) {
    console.error('Encryption failed:', err);
    throw new Error('Verschlüsselung fehlgeschlagen.');
  }
}

/**
 * Decrypts GRAVIQ_ENC_v1 formatted ciphertext payload
 */
export async function decryptData(cipherPayload: string, masterPass: string): Promise<string> {
  try {
    if (!cipherPayload.startsWith('GRAVIQ_ENC_v1:')) {
      return cipherPayload; // Plain text or unencrypted
    }

    const base64 = cipherPayload.replace('GRAVIQ_ENC_v1:', '');
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }

    const salt = buffer.slice(0, 16);
    const iv = buffer.slice(16, 28);
    const ciphertext = buffer.slice(28);

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(masterPass),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const decryptedContent = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decryptedContent);
  } catch (err) {
    console.error('Decryption failed:', err);
    throw new Error('Entschlüsselung fehlgeschlagen. Passwort oder 2FA Key falsch.');
  }
}
