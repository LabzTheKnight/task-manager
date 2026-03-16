import { type NextFunction, type Request, type Response } from 'express';

import { verifyAccessToken } from '../lib/auth';
import type { AuthenticatedUser } from '../types/auth';

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.slice('Bearer '.length).trim();

  try {
    const payload = verifyAccessToken(token);

    if (payload.type !== 'access') {
      return res.status(401).json({ message: 'Invalid access token' });
    }

    req.user = {
      id: Number(payload.sub),
      email: payload.email,
    };

    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}