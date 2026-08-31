import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { JwtPayload } from './auth.types';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ error: 'Not authorized, no token provided' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Get user from database
    const [user] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);

    if (!user) {
      res.status(401).json({ error: 'Not authorized, user not found' });
      return;
    }

    if (!user.emailVerified) {
      res.status(403).json({ error: 'Please verify your email address to access this feature' });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Not authorized, token verification failed' });
  }
};
