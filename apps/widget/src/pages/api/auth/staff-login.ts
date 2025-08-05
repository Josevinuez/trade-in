import { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await AuthService.authenticateStaff(email, password);

    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    // Create auth token
    const token = await AuthService.createAuthToken(result.user!.id, 'STAFF');

    const staff = result.user as any; // Type assertion for staff user
    res.status(200).json({
      success: true,
      token,
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
    res.status(500).json({ error: 'Authentication failed' });
  }
} 