"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("./auth.middleware");
const router = (0, express_1.Router)();
// Public auth routes
router.post('/register', auth_controller_1.authController.register);
router.post('/verify-email', auth_controller_1.authController.verifyEmail);
router.post('/resend-verification', auth_controller_1.authController.resendVerification);
router.post('/login', auth_controller_1.authController.login);
router.post('/logout', auth_controller_1.authController.logout);
router.post('/forgot-password', auth_controller_1.authController.forgotPassword);
router.post('/reset-password', auth_controller_1.authController.resetPassword);
// Protected auth routes
router.post('/change-password', auth_middleware_1.protect, auth_controller_1.authController.changePassword);
router.get('/profile', auth_middleware_1.protect, auth_controller_1.authController.getProfile);
router.patch('/profile', auth_middleware_1.protect, auth_controller_1.authController.updateProfile);
exports.default = router;
