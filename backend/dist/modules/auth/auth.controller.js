"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const auth_validation_1 = require("./auth.validation");
class AuthController {
    register = async (req, res) => {
        try {
            const parsed = auth_validation_1.registerSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ error: parsed.error.issues[0].message });
                return;
            }
            const { username, email, password } = parsed.data;
            // Check if email already exists
            const existingEmail = await auth_service_1.authService.findByEmail(email);
            if (existingEmail) {
                res.status(400).json({ error: 'Email already registered' });
                return;
            }
            // Check if username already exists
            const existingUsername = await auth_service_1.authService.findByUsername(username);
            if (existingUsername) {
                res.status(400).json({ error: 'Username already taken' });
                return;
            }
            // Hash password
            const passwordHash = await auth_service_1.authService.hashPassword(password);
            // Generate verification token
            const verificationToken = auth_service_1.authService.generateRandomToken();
            const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            // Create user
            await auth_service_1.authService.createUser({
                username,
                email,
                passwordHash,
                verificationToken,
                verificationTokenExpiresAt,
            });
            // Log mock email verification link to backend console
            const verifyLink = `http://localhost:5173/verify-email?token=${verificationToken}`;
            console.log('\n----------------------------------------');
            console.log(`[MOCK EMAIL] Verification email sent to: ${email}`);
            console.log(`[MOCK EMAIL] Click here to verify: ${verifyLink}`);
            console.log('----------------------------------------\n');
            res.status(201).json({
                message: 'Registration successful. Please check your email console logs to verify your account.',
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Internal server error during registration' });
        }
    };
    verifyEmail = async (req, res) => {
        try {
            const { token } = req.body;
            if (!token) {
                res.status(400).json({ error: 'Verification token is required' });
                return;
            }
            const user = await auth_service_1.authService.findByVerificationToken(token);
            if (!user) {
                res.status(400).json({ error: 'Invalid or expired verification token' });
                return;
            }
            if (user.verificationTokenExpiresAt && new Date() > user.verificationTokenExpiresAt) {
                res.status(400).json({ error: 'Verification token has expired' });
                return;
            }
            if (user.emailVerified) {
                res.status(400).json({ error: 'Email is already verified' });
                return;
            }
            await auth_service_1.authService.verifyUserEmail(user.id);
            res.json({ message: 'Email verified successfully! You can now log in.' });
        }
        catch (error) {
            console.error('Email verification error:', error);
            res.status(500).json({ error: 'Internal server error during email verification' });
        }
    };
    resendVerification = async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ error: 'Email is required' });
                return;
            }
            const user = await auth_service_1.authService.findByEmail(email);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            if (user.emailVerified) {
                res.status(400).json({ error: 'Email is already verified' });
                return;
            }
            const verificationToken = auth_service_1.authService.generateRandomToken();
            const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            await auth_service_1.authService.setVerificationToken(user.id, verificationToken, verificationTokenExpiresAt);
            // Log mock email
            const verifyLink = `http://localhost:5173/verify-email?token=${verificationToken}`;
            console.log('\n----------------------------------------');
            console.log(`[MOCK EMAIL] Verification email resent to: ${email}`);
            console.log(`[MOCK EMAIL] Click here to verify: ${verifyLink}`);
            console.log('----------------------------------------\n');
            res.json({ message: 'Verification link resent. Please check your email console logs.' });
        }
        catch (error) {
            console.error('Resend verification error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
    login = async (req, res) => {
        try {
            const parsed = auth_validation_1.loginSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ error: parsed.error.issues[0].message });
                return;
            }
            const { email, password } = parsed.data;
            const user = await auth_service_1.authService.findByEmail(email);
            if (!user) {
                res.status(401).json({ error: 'Invalid email or password' });
                return;
            }
            // Check password
            const isPasswordValid = await auth_service_1.authService.comparePassword(password, user.passwordHash);
            if (!isPasswordValid) {
                res.status(401).json({ error: 'Invalid email or password' });
                return;
            }
            // Reject unverified accounts
            if (!user.emailVerified) {
                res.status(403).json({
                    error: 'Please verify your email address before logging in.',
                    unverified: true,
                });
                return;
            }
            // Generate JWT
            const token = auth_service_1.authService.generateJwt(user.id, user.email);
            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error during login' });
        }
    };
    logout = async (req, res) => {
        // JWT logout is handled client-side by dropping the token, but we provide an endpoint
        res.json({ message: 'Logged out successfully' });
    };
    forgotPassword = async (req, res) => {
        try {
            const parsed = auth_validation_1.forgotPasswordSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ error: parsed.error.issues[0].message });
                return;
            }
            const { email } = parsed.data;
            const user = await auth_service_1.authService.findByEmail(email);
            // Return success regardless of whether user exists to prevent email enumeration
            if (user) {
                const resetToken = auth_service_1.authService.generateRandomToken();
                const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
                await auth_service_1.authService.setResetPasswordToken(user.id, resetToken, resetTokenExpiresAt);
                // Log mock email
                const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
                console.log('\n----------------------------------------');
                console.log(`[MOCK EMAIL] Password reset email sent to: ${email}`);
                console.log(`[MOCK EMAIL] Click here to reset: ${resetLink}`);
                console.log('----------------------------------------\n');
            }
            res.json({
                message: 'If an account exists with that email, a password reset link has been sent to your console logs.',
            });
        }
        catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
    resetPassword = async (req, res) => {
        try {
            const parsed = auth_validation_1.resetPasswordSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ error: parsed.error.issues[0].message });
                return;
            }
            const { token, password } = parsed.data;
            const user = await auth_service_1.authService.findByResetToken(token);
            if (!user) {
                res.status(400).json({ error: 'Invalid or expired password reset token' });
                return;
            }
            if (user.resetPasswordTokenExpiresAt && new Date() > user.resetPasswordTokenExpiresAt) {
                res.status(400).json({ error: 'Password reset token has expired' });
                return;
            }
            // Hash password
            const passwordHash = await auth_service_1.authService.hashPassword(password);
            await auth_service_1.authService.updatePassword(user.id, passwordHash);
            res.json({ message: 'Password reset successful! You can now log in.' });
        }
        catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
    changePassword = async (req, res) => {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }
            const parsed = auth_validation_1.changePasswordSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ error: parsed.error.issues[0].message });
                return;
            }
            const { currentPassword, newPassword } = parsed.data;
            // Verify current password
            const isPasswordValid = await auth_service_1.authService.comparePassword(currentPassword, req.user.passwordHash);
            if (!isPasswordValid) {
                res.status(400).json({ error: 'Incorrect current password' });
                return;
            }
            // Hash new password and save
            const passwordHash = await auth_service_1.authService.hashPassword(newPassword);
            await auth_service_1.authService.updatePassword(req.user.id, passwordHash);
            // Respond with instructions to require a fresh login
            res.json({
                message: 'Password changed successfully. Please log in again with your new password.',
            });
        }
        catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
    getProfile = async (req, res) => {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        res.json({
            user: {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email,
                emailVerified: req.user.emailVerified,
                createdAt: req.user.createdAt,
                updatedAt: req.user.updatedAt,
            },
        });
    };
    updateProfile = async (req, res) => {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }
            const parsed = auth_validation_1.updateProfileSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ error: parsed.error.issues[0].message });
                return;
            }
            const { username, email } = parsed.data;
            const updates = {};
            if (username !== undefined && username !== req.user.username) {
                // Check if username taken
                const existingUsername = await auth_service_1.authService.findByUsername(username);
                if (existingUsername) {
                    res.status(400).json({ error: 'Username already taken' });
                    return;
                }
                updates.username = username;
            }
            if (email !== undefined && email !== req.user.email) {
                // Check if email taken
                const existingEmail = await auth_service_1.authService.findByEmail(email);
                if (existingEmail) {
                    res.status(400).json({ error: 'Email already registered' });
                    return;
                }
                updates.email = email;
                updates.emailVerified = false;
                // Generate new verification token
                const verificationToken = auth_service_1.authService.generateRandomToken();
                const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
                updates.verificationToken = verificationToken;
                updates.verificationTokenExpiresAt = verificationTokenExpiresAt;
                // Log mock email
                const verifyLink = `http://localhost:5173/verify-email?token=${verificationToken}`;
                console.log('\n----------------------------------------');
                console.log(`[MOCK EMAIL] Email update requested. Verification email sent to: ${email}`);
                console.log(`[MOCK EMAIL] Click here to verify: ${verifyLink}`);
                console.log('----------------------------------------\n');
            }
            if (Object.keys(updates).length === 0) {
                res.json({
                    user: {
                        id: req.user.id,
                        username: req.user.username,
                        email: req.user.email,
                        emailVerified: req.user.emailVerified,
                        createdAt: req.user.createdAt,
                        updatedAt: req.user.updatedAt,
                    },
                });
                return;
            }
            const updatedUser = await auth_service_1.authService.updateProfile(req.user.id, updates);
            res.json({
                message: updates.email !== undefined ? 'Profile updated. Please verify your new email address.' : 'Profile updated successfully.',
                user: {
                    id: updatedUser.id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    emailVerified: updatedUser.emailVerified,
                    createdAt: updatedUser.createdAt,
                    updatedAt: updatedUser.updatedAt,
                },
            });
        }
        catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
