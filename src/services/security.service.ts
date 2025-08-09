import prisma from '../client';

const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const generate2FASecret = async (userId: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const secret = speakeasy.generateSecret({
    name: `Outsourcing (${user.email})`,
  });

  await prisma.security.upsert({
    where: { userId },
    update: { twoFactorSecret: secret.base32 },
    create: {
      userId,
      twoFactorSecret: secret.base32,
      backupCodes: [],
    },
  });

  const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    otpauth_url: secret.otpauth_url,
    qrCodeDataURL,
  };
};

const verify2FAToken = async (userId: number, token: string) => {
  const security = await prisma.security.findUnique({ where: { userId } });
  if (!security || !security.twoFactorSecret) {
    throw new Error('2FA not initialized');
  }

  const verified = speakeasy.totp.verify({
    secret: security.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 2,
  });

  if (!verified) throw new Error('Invalid token');

  await prisma.security.update({
    where: { userId },
    data: { twoFactorEnabled: true },
  });

  return { message: '2FA enabled' };
};

const disable2FA = async (userId: number) => {
  await prisma.security.update({
    where: { userId },
    data: {
      twoFactorEnabled: false,
      isCodeVerified: false,
      twoFactorSecret: null,
      backupCodes: [],
    },
  });

  return { message: '2FA disabled' };
};
const disableCodeVerification = async (userId: number) => {
  await prisma.security.update({
    where: { userId },
    data: {
      isCodeVerified: false,
    },
  });

  return { message: 'Code verification disabled' };
};
const verifyCode = async (userId: number, code: string) => {
  const security = await prisma.security.findUnique({ where: { userId } });
  if (!security || !security.twoFactorSecret) {
    throw new Error('2FA not initialized');
  }

  const verified = speakeasy.totp.verify({
    secret: security.twoFactorSecret,
    encoding: 'base32',
    token: code,
    window: 2,
  });

  if (!verified) throw new Error('Invalid token');

  await prisma.security.update({
    where: { userId },
    data: { isCodeVerified: true },
  });

  return { message: 'Code verified' };
};

export default {
  generate2FASecret,
  verify2FAToken,
  disable2FA,
  verifyCode,
  disableCodeVerification,
};
