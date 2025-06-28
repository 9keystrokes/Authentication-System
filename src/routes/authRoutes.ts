import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  signupSchema,
  loginSchema,
  updateUserSchema,
  changePasswordSchema,
  passwordResetRequestSchema
} from '../validation/authValidation';

const router = Router();

router.post('/signup', validate(signupSchema), AuthController.signup);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/password-reset-request', validate(passwordResetRequestSchema), AuthController.requestPasswordReset);

router.get('/me', authenticate, AuthController.getMe);
router.patch('/me', authenticate, validate(updateUserSchema), AuthController.updateMe);
router.delete('/me', authenticate, AuthController.deleteMe);
router.patch('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);
router.post('/logout', authenticate, AuthController.logout);

router.get('/users', authenticate, authorize('admin'), AuthController.getAllUsers);
router.get('/users/:id', authenticate, authorize('admin'), AuthController.getUserById);
router.patch('/users/:id', authenticate, authorize('admin'), validate(updateUserSchema), AuthController.updateUserById);
router.delete('/users/:id', authenticate, authorize('admin'), AuthController.deleteUserById);

export default router;
