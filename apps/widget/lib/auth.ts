import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../src/utils/supabase';
import jwt from 'jsonwebtoken';

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

export class AuthService {
  // Staff authentication
  static async authenticateStaff(email: string, password: string): Promise<AuthResult> {
    try {
      const { data: staff, error } = await supabaseAdmin
        .from('StaffUser')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !staff) {
        return { success: false, error: 'Invalid email or password' };
      }

      if (!staff.isActive) {
        return { success: false, error: 'Account is deactivated' };
      }

      const isValidPassword = await bcrypt.compare(password, staff.passwordHash);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid email or password' };
      }

      return { success: true, user: staff };
    } catch (error) {
      console.error('Staff authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  // Create JWT auth token
  static async createAuthToken(userId: number, userType: 'STAFF'): Promise<string> {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT secret not configured');
    return jwt.sign({ id: userId, role: 'staff' }, secret, { expiresIn: '1h' });
  }

  // Validate JWT auth token
  static async validateAuthToken(token: string): Promise<AuthResult> {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret || !token) return { success: false, error: 'Invalid token' };
      const decoded = jwt.verify(token, secret) as any;
      return { success: true, user: decoded };
    } catch (error) {
      console.error('Token validation error:', error);
      return { success: false, error: 'Token validation failed' };
    }
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  // Clean up expired tokens (not needed with JWT)
  static async cleanupExpiredTokens(): Promise<void> {
    // JWT tokens are stateless, so no cleanup needed
    return;
  }
} 