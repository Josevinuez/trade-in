import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../src/utils/supabase';

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

  // Create auth token (simplified - using JWT tokens instead)
  static async createAuthToken(userId: number, userType: 'STAFF'): Promise<string> {
    // For now, we'll use a simple token generation
    // In a real implementation, you'd use Supabase's JWT functionality
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    return token;
  }

  // Validate auth token (simplified)
  static async validateAuthToken(token: string): Promise<AuthResult> {
    try {
      // For now, we'll use a simple validation
      // In a real implementation, you'd validate JWT tokens with Supabase
      if (!token) {
        return { success: false, error: 'Invalid token' };
      }

      // For demo purposes, we'll assume the token is valid
      // In production, you'd decode and validate the JWT
      return { success: true, user: { id: 1, email: 'admin@example.com', role: 'staff' } };
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