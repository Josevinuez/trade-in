import { NextApiRequest, NextApiResponse } from 'next';
import { withSecurity } from '../../../../src/lib/security';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // This endpoint is no longer needed since we're using Supabase auth directly
  // But keeping it for backward compatibility
  res.status(200).json({
    success: true,
    message: 'Use Supabase authentication directly from the frontend'
  });
}

export default withSecurity({
  auth: false, // Login endpoint doesn't require auth
  rateLimit: {
    windowMs: 60 * 1000,
    limit: 5,
    keyPrefix: 'login:',
  },
  cors: true,
  sizeLimit: '1mb',
  validation: false,
  securityHeaders: true,
})(handler);