import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { catchAsync } from '../middleware/errorHandler';
import { AppError } from '../utils/appError';

export class AuthController {
  static signup = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.signup(req.body);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: result
    });
  });

  static login = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: result
    });
  });

  static getMe = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const user = await AuthService.getUserById(req.user.id);

    res.status(200).json({
      status: 'success',
      message: 'User retrieved successfully',
      data: { user }
    });
  });

  static updateMe = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    if (req.body.password) {
      throw new AppError('This route is not for password updates. Use /change-password', 400);
    }

    const user = await AuthService.updateUser(req.user.id, req.body);

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: { user }
    });
  });

  static changePassword = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { currentPassword, newPassword } = req.body;

    await AuthService.changePassword(req.user.id, currentPassword, newPassword);

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  });

  static deleteMe = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    await AuthService.deleteUser(req.user.id);

    res.status(204).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  });

  static getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;

    const result = await AuthService.getAllUsers(page, limit, role);

    res.status(200).json({
      status: 'success',
      message: 'Users retrieved successfully',
      data: result
    });
  });

  // Get user by ID (admin only)
  static getUserById = catchAsync(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      throw new AppError('Invalid user ID', 400);
    }

    const user = await AuthService.getUserById(userId);

    res.status(200).json({
      status: 'success',
      message: 'User retrieved successfully',
      data: { user }
    });
  });

  // Update user by ID (admin only)
  static updateUserById = catchAsync(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      throw new AppError('Invalid user ID', 400);
    }

    if (req.body.password) {
      throw new AppError('Password updates not allowed through this route', 400);
    }

    const user = await AuthService.updateUser(userId, req.body);

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: { user }
    });
  });

  static deleteUserById = catchAsync(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      throw new AppError('Invalid user ID', 400);
    }

    await AuthService.deleteUser(userId);

    res.status(204).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  });

  static requestPasswordReset = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;

    await AuthService.requestPasswordReset(email);

    res.status(200).json({
      status: 'success',
      message: 'If the email exists, a password reset link has been sent'
    });
  });

  static logout = catchAsync(async (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  });
}
