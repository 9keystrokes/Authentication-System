import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import { AppError } from '../utils/appError';
import User from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new AppError('Access denied. No token provided.', 401);
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      throw new AppError('Access denied. Invalid token format.', 401);
    }

    const decoded: JWTPayload = verifyToken(token);
    
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      throw new AppError('Access denied. User not found.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Access denied. Invalid token.', 401));
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError('Access denied. Authentication required.', 401);
      }

      if (!roles.includes(req.user.role)) {
        throw new AppError('Access denied. Insufficient permissions.', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return next();
    }

    const decoded: JWTPayload = verifyToken(token);
    
    const user = await User.findByPk(decoded.id);
    
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    next();
  }
};
