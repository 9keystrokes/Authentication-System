import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { ValidationError } from 'sequelize';

const sendErrorDev = (error: AppError, res: Response): void => {
  res.status(error.statusCode).json({
    status: 'error',
    error: {
      message: error.message,
      stack: error.stack,
      details: error.details
    }
  });
};

const sendErrorProd = (error: AppError, res: Response): void => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      ...(error.details && { details: error.details })
    });
  } else {
    console.error('ERROR 💥:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

const handleSequelizeValidationError = (error: ValidationError): AppError => {
  const errors = error.errors.map(err => ({
    field: err.path || 'unknown',
    message: err.message,
    value: err.value
  }));

  return new AppError('Validation failed', 400, errors);
};

const handleSequelizeUniqueConstraintError = (error: any): AppError => {
  const field = error.errors?.[0]?.path || 'field';
  const value = error.errors?.[0]?.value || 'value';
  
  return new AppError(`${field} '${value}' already exists`, 409);
};

const handleSequelizeForeignKeyConstraintError = (error: any): AppError => {
  return new AppError('Referenced record does not exist', 400);
};

// Handle JWT errors
const handleJWTError = (): AppError => {
  return new AppError('Invalid token. Please log in again.', 401);
};

const handleJWTExpiredError = (): AppError => {
  return new AppError('Your token has expired. Please log in again.', 401);
};

// Handle database connection errors
const handleDatabaseConnectionError = (): AppError => {
  return new AppError('Database connection failed', 500);
};

// Main error handling middleware
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let err = { ...error };
  err.message = error.message;

  // Log error
  console.error('Error:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Sequelize validation error
  if (error.name === 'SequelizeValidationError') {
    err = handleSequelizeValidationError(error);
  }
  
  // Sequelize unique constraint error
  else if (error.name === 'SequelizeUniqueConstraintError') {
    err = handleSequelizeUniqueConstraintError(error);
  }
  
  // Sequelize foreign key constraint error
  else if (error.name === 'SequelizeForeignKeyConstraintError') {
    err = handleSequelizeForeignKeyConstraintError(error);
  }
  
  // JWT errors
  else if (error.name === 'JsonWebTokenError') {
    err = handleJWTError();
  }
  else if (error.name === 'TokenExpiredError') {
    err = handleJWTExpiredError();
  }
  
  // Database connection errors
  else if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeConnectionRefusedError') {
    err = handleDatabaseConnectionError();
  }
  
  // Cast to AppError if not already
  if (!(err instanceof AppError)) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong!';
    err = new AppError(message, statusCode, err.details, false);
  }

  // Send error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

// Catch unhandled async errors
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED PROMISE REJECTION! 💥 Shutting down...');
  console.error('Error:', err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error('Error:', err.name, err.message);
  process.exit(1);
});
