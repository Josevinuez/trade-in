import { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '../../../../lib/auth';
import { z } from 'zod';
import { withRateLimit } from '../../../../src/lib/security';

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = bodySchema.parse(req.body);

    const result = await AuthService.authenticateStaff(email, password);

    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    // Create auth token
    const token = await AuthService.createAuthToken(result.user!.id, 'STAFF');

    // Set HttpOnly, Secure cookie
    const prod = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', `auth_token=${token}; Path=/; HttpOnly; ${prod ? 'Secure; ' : ''}SameSite=Strict; Max-Age=3600`);

    const staff = result.user as any;
    res.status(200).json({
      success: true,
      token, // provided for backward compatibility; prefer HttpOnly cookie
      user: {
        id: staff.id,
        email: staff.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: staff.role,
      }
    });

  } catch (error) {
    console.error('Staff login error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export default withRateLimit({ windowMs: 60_000, limit: 5, keyPrefix: 'login:' })(handler);