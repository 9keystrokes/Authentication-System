import jwt from 'jsonwebtoken';
import { UserAttributes } from '../models/User';

export interface JWTPayload {
  id: number;
  email: string;
  role: 'user' | 'admin';
}

export const generateToken = (user: UserAttributes): string => {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-jwt-secret',
    {
      expiresIn: (process.env.JWT_EXPIRES_IN || '60d') as any,
      issuer: 'auth-system',
      audience: 'auth-system-users'
    }
  );
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    const secret = process.env.JWT_SECRET || 'your-jwt-secret';
    
    const decoded = jwt.verify(token, secret, {
      issuer: 'auth-system',
      audience: 'auth-system-users'
    }) as any;

    return decoded as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof jwt.NotBeforeError) {
      throw new Error('Token not active');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

export const generateRefreshToken = (user: UserAttributes): string => {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || 'your-jwt-refresh-secret',
    {
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '60d') as any,
      issuer: 'auth-system',
      audience: 'auth-system-refresh'
    }
  );
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    const secret = process.env.JWT_REFRESH_SECRET || 'your-jwt-refresh-secret';
    
    const decoded = jwt.verify(token, secret, {
      issuer: 'auth-system',
      audience: 'auth-system-refresh'
    }) as any;

    return decoded as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    } else if (error instanceof jwt.NotBeforeError) {
      throw new Error('Refresh token not active');
    } else {
      throw new Error('Refresh token verification failed');
    }
  }
};
