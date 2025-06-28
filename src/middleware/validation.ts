import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../utils/appError';

export const validate = (schema: z.ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        throw new AppError('Validation failed', 400, errors);
      }
      
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateQuery = (schema: z.ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        throw new AppError('Query validation failed', 400, errors);
      }
      
      req.query = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateParams = (schema: z.ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        throw new AppError('Parameter validation failed', 400, errors);
      }
      
      req.params = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};
