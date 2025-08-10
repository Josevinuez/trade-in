import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

type Role = 'staff' | 'admin';

function getClientIp(req: NextApiRequest): string {
  const xff = (req.headers['x-forwarded-for'] || '') as string;
  const ip = xff.split(',')[0].trim() || (req.socket?.remoteAddress || 'unknown');
  return ip;
}

export function withAuth(allowedRoles: Role[] = ['staff']) {
  return function <T extends NextApiHandler>(handler: T): NextApiHandler {
    return async function (req: NextApiRequest, res: NextApiResponse) {
      try {
        const bearer = (req.headers.authorization || '').startsWith('Bearer ')
          ? (req.headers.authorization as string).substring('Bearer '.length)
          : undefined;
        const token = bearer || (req.cookies?.['auth_token'] as string | undefined);
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ error: 'Server misconfiguration' });
        const decoded = jwt.verify(token, secret) as { id: number | string; role?: Role };
        const role: Role = (decoded.role as Role) || 'staff';
        if (!allowedRoles.includes(role)) return res.status(403).json({ error: 'Forbidden' });
        return handler(req, res);
      } catch {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    };
  };
}

type RateLimiterOptions = {
  windowMs: number;
  limit: number;
  keyPrefix?: string;
};

const buckets = new Map<string, { hits: number; resetAt: number }>();

export function withRateLimit(options: RateLimiterOptions) {
  const windowMs = options.windowMs;
  const limit = options.limit;
  const prefix = options.keyPrefix || 'rl:';
  return function <T extends NextApiHandler>(handler: T): NextApiHandler {
    return async function (req: NextApiRequest, res: NextApiResponse) {
      const ip = getClientIp(req);
      const key = `${prefix}${ip}:${req.method}:${req.url?.split('?')[0]}`;
      const now = Date.now();
      const bucket = buckets.get(key) || { hits: 0, resetAt: now + windowMs };
      if (now > bucket.resetAt) {
        bucket.hits = 0;
        bucket.resetAt = now + windowMs;
      }
      bucket.hits += 1;
      buckets.set(key, bucket);
      const remaining = Math.max(0, limit - bucket.hits);
      res.setHeader('X-RateLimit-Limit', String(limit));
      res.setHeader('X-RateLimit-Remaining', String(remaining));
      res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));
      if (bucket.hits > limit) {
        return res.status(429).json({ error: 'Too many requests' });
      }
      return handler(req, res);
    };
  };
}


