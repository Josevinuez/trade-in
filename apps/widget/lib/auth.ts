import bcrypt from 'bcryptjs';
import { prisma } from './database';
import { Staff, Customer } from '@prisma/client';

export interface AuthResult {
  success: boolean;
  user?: Staff | Customer;
  error?: string;
}

export class AuthService {
  // Staff authentication
  static async authenticateStaff(email: string, password: string): Promise<AuthResult> {
    try {
      const staff = await prisma.staff.findUnique({
        where: { email },
      });

      if (!staff) {
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

  // Create auth token
  static async createAuthToken(userId: number, userType: 'STAFF'): Promise<string> {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.authToken.create({
      data: {
        userId,
        userType,
        token,
        expiresAt,
      },
    });

    return token;
  }

  // Validate auth token
  static async validateAuthToken(token: string): Promise<AuthResult> {
    try {
      const authToken = await prisma.authToken.findUnique({
        where: { token },
      });

      if (!authToken) {
        return { success: false, error: 'Invalid token' };
      }

      if (authToken.expiresAt < new Date()) {
        // Clean up expired token
        await prisma.authToken.delete({
          where: { id: authToken.id },
        });
        return { success: false, error: 'Token expired' };
      }

      // Get staff user
      const staff = await prisma.staff.findUnique({
        where: { id: authToken.userId },
      });
      return staff ? { success: true, user: staff } : { success: false, error: 'User not found' };
    } catch (error) {
      console.error('Token validation error:', error);
      return { success: false, error: 'Token validation failed' };
    }
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  // Clean up expired tokens
  static async cleanupExpiredTokens(): Promise<void> {
    try {
      await prisma.authToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }
} 