import { Router } from 'express';
import { authController } from './auth.controller';
import { protect } from './auth.middleware';

const router = Router();

// Public auth routes
router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected auth routes
router.post('/change-password', protect, authController.changePassword);
router.get('/profile', protect, authController.getProfile);
router.patch('/profile', protect, authController.updateProfile);

export default router;
