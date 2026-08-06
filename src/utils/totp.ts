import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

export interface TOTPSetupResult {
  secret: string;
  uri: string;
  qrCodeUrl: string;
}

/**
 * Generates a new TOTP secret for Google Authenticator setup
 */
export async function generateTOTPSecret(accountName: string = 'Admin'): Promise<TOTPSetupResult> {
  const totp = new OTPAuth.TOTP({
    issuer: 'Graviq Shop',
    label: accountName,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: new OTPAuth.Secret(),
  });

  const uri = totp.toString();
  const secret = totp.secret.base32;

  // Generate QR Code data URL
  const qrCodeUrl = await QRCode.toDataURL(uri, {
    width: 240,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });

  return {
    secret,
    uri,
    qrCodeUrl,
  };
}

/**
 * Verifies a 6-digit TOTP code against a secret key
 */
export function verifyTOTPCode(secretBase32: string, token: string): boolean {
  try {
    const cleanToken = token.replace(/\s+/g, '').trim();
    if (!cleanToken || cleanToken.length !== 6) {
      return false;
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'Graviq Shop',
      label: 'Admin',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secretBase32),
    });

    // delta returns number if valid, null if invalid. Allow window of 1 period (30s) drift
    const delta = totp.validate({ token: cleanToken, window: 1 });
    return delta !== null;
  } catch (err) {
    console.error('TOTP verification error:', err);
    return false;
  }
}
