import crypto from 'node:crypto';

import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

import type { AuthTokenPayload } from '../types/auth';

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';
const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

if (!accessSecret || !refreshSecret) {
  throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set');
}

const accessSignOptions: SignOptions = { expiresIn: accessExpiresIn as SignOptions['expiresIn'] };
const refreshSignOptions: SignOptions = { expiresIn: refreshExpiresIn as SignOptions['expiresIn'] };

export function createAccessToken(userId: number, email: string) {
  return jwt.sign({ email, type: 'access' }, accessSecret as Secret, {
    ...accessSignOptions,
    subject: String(userId),
  });
}

export function createRefreshToken(userId: number, email: string) {
  const tokenId = crypto.randomUUID();
  const token = jwt.sign({ email, type: 'refresh', tokenId }, refreshSecret as Secret, {
    ...refreshSignOptions,
    subject: String(userId),
  });

  return { token, tokenId };
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, accessSecret as Secret) as AuthTokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, refreshSecret as Secret) as AuthTokenPayload & { tokenId?: string };
}

export function getRefreshTokenExpiryDate() {
  const now = Date.now();
  const daysMatch = refreshExpiresIn.match(/^(\d+)d$/);
  const hoursMatch = refreshExpiresIn.match(/^(\d+)h$/);

  if (daysMatch) {
    return new Date(now + Number(daysMatch[1]) * 24 * 60 * 60 * 1000);
  }

  if (hoursMatch) {
    return new Date(now + Number(hoursMatch[1]) * 60 * 60 * 1000);
  }

  return new Date(now + 7 * 24 * 60 * 60 * 1000);
}