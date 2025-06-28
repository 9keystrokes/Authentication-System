import bcrypt from 'bcryptjs';
import User, { UserAttributes } from '../models/User';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/appError';
import { SignupInput, LoginInput } from '../validation/authValidation';

export interface AuthResponse {
  user: Omit<UserAttributes, 'password'>;
  token: string;
  refreshToken: string;
}

export class AuthService {
  static async signup(signupData: SignupInput): Promise<AuthResponse> {
    try {
      const existingUser = await User.findOne({ where: { email: signupData.email } });
      
      if (existingUser) {
        throw new AppError('Email already registered', 409);
      }

      const user = await User.create({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        role: signupData.role || 'user'
      });

      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      return {
        user: user.toJSON(),
        token,
        refreshToken
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create user', 500);
    }
  }

  static async login(loginData: LoginInput): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await User.findOne({ where: { email: loginData.email } });
      
      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      // Check password
      const isPasswordValid = await user.comparePassword(loginData.password);
      
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      // Generate tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      return {
        user: user.toJSON(),
        token,
        refreshToken
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to login', 500);
    }
  }

  // Get user by ID
  static async getUserById(userId: number): Promise<Omit<UserAttributes, 'password'>> {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      return user.toJSON();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch user', 500);
    }
  }

  // Update user
  static async updateUser(
    userId: number, 
    updateData: Partial<Pick<UserAttributes, 'name' | 'email' | 'role'>>
  ): Promise<Omit<UserAttributes, 'password'>> {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Check if email is being updated and if it's already taken
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findOne({ where: { email: updateData.email } });
        if (existingUser) {
          throw new AppError('Email already in use', 409);
        }
      }

      // Update user
      await user.update(updateData);
      
      return user.toJSON();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update user', 500);
    }
  }

  // Change password
  static async changePassword(
    userId: number, 
    currentPassword: string, 
    newPassword: string
  ): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400);
      }

      // Update password
      await user.update({ password: newPassword });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to change password', 500);
    }
  }

  // Delete user
  static async deleteUser(userId: number): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      await user.destroy();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete user', 500);
    }
  }

  // Get all users (admin only)
  static async getAllUsers(
    page: number = 1, 
    limit: number = 10,
    role?: string
  ): Promise<{
    users: Omit<UserAttributes, 'password'>[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const offset = (page - 1) * limit;
      const whereClause = role ? { role } : {};

      const { count, rows } = await User.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      const users = rows.map(user => user.toJSON());

      return {
        users,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      throw new AppError('Failed to fetch users', 500);
    }
  }

  // Password reset request (bonus feature)
  static async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        // Don't reveal if email exists or not for security
        return;
      }

      // In a real application, you would:
      // 1. Generate a secure reset token
      // 2. Store it in database with expiration
      // 3. Send email with reset link
      
      console.log(`Password reset requested for user: ${user.email}`);
      // This is a placeholder - implement actual email sending
    } catch (error) {
      throw new AppError('Failed to process password reset request', 500);
    }
  }
}
