import crypto from 'crypto';

export function generateNumericOtp(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }
  return otp;
}

export function hashOtp(otp: string, email: string): string {
  const hmac = crypto.createHmac('sha256', getOtpSecret());
  hmac.update(`${email}:${otp}`);
  return hmac.digest('hex');
}

export function getOtpExpiryDate(minutes: number = 5): Date {
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + minutes);
  return expires;
}

function getOtpSecret(): string {
  const secret = process.env.OTP_SECRET;
  if (!secret) {
    throw new Error('OTP_SECRET is not defined');
  }
  return secret;
}


