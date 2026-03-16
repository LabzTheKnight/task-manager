import express, { type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';

import {
  createAccessToken,
  createRefreshToken,
  getRefreshTokenExpiryDate,
  verifyRefreshToken,
} from '../lib/auth';
import prisma from '../lib/prisma';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const SALT_ROUNDS = 10;

function normalizeEmail(email: unknown) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function sanitizeUser(user: { id: number; email: string; createdAt: Date; updatedAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

router.post('/auth/register', async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body?.email);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email) {
    return res.status(400).json({ message: 'email is required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'password must be at least 8 characters long' });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return res.status(409).json({ message: 'email is already registered' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  });

  const accessToken = createAccessToken(user.id, user.email);
  const { token: refreshToken } = createRefreshToken(user.id, user.email);

  await prisma.userSession.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: getRefreshTokenExpiryDate(),
    },
  });

  return res.status(201).json({
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  });
});

router.post('/auth/login', async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body?.email);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: 'invalid credentials' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return res.status(401).json({ message: 'invalid credentials' });
  }

  const accessToken = createAccessToken(user.id, user.email);
  const { token: refreshToken } = createRefreshToken(user.id, user.email);

  await prisma.userSession.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: getRefreshTokenExpiryDate(),
    },
  });

  return res.status(200).json({
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  });
});

router.post('/auth/refresh', async (req: Request, res: Response) => {
  const refreshToken = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : '';

  if (!refreshToken) {
    return res.status(400).json({ message: 'refreshToken is required' });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    if (payload.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const session = await prisma.userSession.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Refresh session is invalid or expired' });
    }

    const accessToken = createAccessToken(session.user.id, session.user.email);
    return res.status(200).json({ accessToken });
  } catch {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

router.post('/auth/logout', async (req: Request, res: Response) => {
  const refreshToken = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : '';

  if (!refreshToken) {
    return res.status(400).json({ message: 'refreshToken is required' });
  }

  await prisma.userSession.deleteMany({
    where: { refreshToken },
  });

  return res.status(204).send();
});

router.get('/auth/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.status(200).json({ user: sanitizeUser(user) });
});

export default router;