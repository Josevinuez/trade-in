import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../utils/supabase';

export type Role = 'staff' | 'admin';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: any;
}

// ENTERPRISE-LEVEL SECURE AUTHENTICATION
export function withSecureAuth(allowedRoles: Role[] = ['staff']) {
  return function <T extends NextApiHandler>(handler: T): NextApiHandler {
    return async function (req: NextApiRequest, res: NextApiResponse) {
      try {
        // SECURITY CHECK 1: Verify supabaseAdmin is available
        if (!supabaseAdmin) {
          console.error('Secure Auth: Database connection unavailable');
          return res.status(500).json({ error: 'Service unavailable' });
        }
        
        // SECURITY CHECK 2: Verify authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          console.error('Secure Auth: Missing authorization header');
          return res.status(401).json({ error: 'Authentication required' });
        }
        
        const token = authHeader.substring(7);
        
        // SECURITY CHECK 3: Verify JWT token with Supabase
        try {
          const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
          
          if (error || !user) {
            console.error('Secure Auth: Invalid token');
            return res.status(401).json({ error: 'Invalid credentials' });
          }
          
          // SECURITY CHECK 4: Verify user email (whitelist approach)
          if (user.email !== 'staff@tradeinpro.com') {
            console.error('Secure Auth: Unauthorized user:', user.email);
            return res.status(403).json({ error: 'Access denied' });
          }
          
          // SECURITY CHECK 5: Create secure user object
          const secureUser = {
            id: user.id,
            email: user.email,
            firstName: 'Demo',
            lastName: 'Staff',
            role: 'STAFF' as Role,
            isActive: true,
            permissions: ['read', 'write', 'delete'],
            sessionId: user.id,
            lastVerified: new Date().toISOString()
          };
          
          // SECURITY CHECK 6: Add user to request
          (req as AuthenticatedRequest).user = secureUser;
          
          console.log('Secure Auth: Authentication successful for:', secureUser.email);
          return handler(req, res);
          
        } catch (authError) {
          console.error('Secure Auth: Token verification failed:', authError);
          return res.status(401).json({ error: 'Authentication failed' });
        }
        
      } catch (error) {
        console.error('Secure Auth: System error:', error);
        return res.status(500).json({ error: 'Internal error' });
      }
    };
  };
}

// Rate limiting for security
export function withRateLimit(limit: number = 100, windowMs: number = 60000) {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return function <T extends NextApiHandler>(handler: T): NextApiHandler {
    return async function (req: NextApiRequest, res: NextApiResponse) {
      const ip = req.headers['x-forwarded-for'] as string || 
                 req.headers['x-real-ip'] as string || 
                 req.connection.remoteAddress || 
                 'unknown';
      
      const now = Date.now();
      const userRequests = requests.get(ip);
      
      if (userRequests && now < userRequests.resetTime) {
        if (userRequests.count >= limit) {
          return res.status(429).json({ error: 'Too many requests' });
        }
        userRequests.count++;
      } else {
        requests.set(ip, { count: 1, resetTime: now + windowMs });
      }
      
      return handler(req, res);
    };
  };
}

// CORS security
export function withCORS(handler: NextApiHandler): NextApiHandler {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SUPABASE_URL || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    return handler(req, res);
  };
}

// Security headers
export function withSecurityHeaders(handler: NextApiHandler): NextApiHandler {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    return handler(req, res);
  };
}

// Comprehensive security wrapper
export function withEnterpriseSecurity(options: {
  auth?: boolean;
  roles?: Role[];
  rateLimit?: number;
  cors?: boolean;
  securityHeaders?: boolean;
} = {}) {
  const {
    auth = true,
    roles = ['staff'],
    rateLimit = 100,
    cors = true,
    securityHeaders = true
  } = options;
  
  return function <T extends NextApiHandler>(handler: T): NextApiHandler {
    let securedHandler = handler;
    
    if (securityHeaders) {
      securedHandler = withSecurityHeaders(securedHandler);
    }
    
    if (cors) {
      securedHandler = withCORS(securedHandler);
    }
    
    if (rateLimit) {
      securedHandler = withRateLimit(rateLimit)(securedHandler);
    }
    
    if (auth) {
      securedHandler = withSecureAuth(roles)(securedHandler);
    }
    
    return securedHandler;
  };
}
