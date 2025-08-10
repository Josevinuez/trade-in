import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'admin' | 'staff';
  };
}

export function requireAuth(roles?: Array<'admin' | 'staff'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.substring('Bearer '.length)
        : undefined;
      if (!token) {
        return res.status(401).json({ error: { message: 'Unauthorized' } });
      }
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return res.status(500).json({ error: { message: 'Server misconfiguration' } });
      }
      const decoded = jwt.verify(token, secret) as { id: string; role: 'admin' | 'staff' };
      if (roles && roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: { message: 'Forbidden' } });
      }
      req.user = decoded;
      return next();
    } catch {
      return res.status(401).json({ error: { message: 'Unauthorized' } });
    }
  };
}


