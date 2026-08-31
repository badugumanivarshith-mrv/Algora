import { Request, Response } from 'express';
import { profileService } from './profile.service';
import { authService } from '../auth/auth.service';
import { updateProfileSchema, avatarSchema, changePasswordSchema } from './profile.validation';
import { emailService } from '../../services/email.service';
import { users } from '../../db/schema';

export class ProfileController {
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const user = await profileService.getProfile(userId);
      if (!user) {
        res.status(404).json({ error: 'User profile not found' });
        return;
      }

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          emailVerified: user.emailVerified,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        stats: {
          problemsSolved: 42,
          submissions: 128,
          successRate: 78.5,
          currentStreak: 5,
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0].message });
        return;
      }

      const { username, displayName, bio, email } = parsed.data;
      const updates: Partial<typeof users.$inferInsert> = {};

      if (displayName !== undefined) updates.displayName = displayName;
      if (bio !== undefined) updates.bio = bio;

      if (username !== undefined && username !== req.user!.username) {
        const existingUsername = await authService.findByUsername(username);
        if (existingUsername) {
          res.status(400).json({ error: 'Username already taken' });
          return;
        }
        updates.username = username;
      }

      if (email !== undefined && email.toLowerCase().trim() !== req.user!.email.toLowerCase().trim()) {
        const existingEmail = await authService.findByEmail(email);
        if (existingEmail) {
          res.status(400).json({ error: 'Email already registered' });
          return;
        }
        updates.email = email;
        updates.emailVerified = false;

        // Generate verification token for re-verification
        const verificationToken = authService.generateRandomToken();
        const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        updates.verificationToken = verificationToken;
        updates.verificationTokenExpiresAt = verificationTokenExpiresAt;

        // Send verification email via EmailService
        await emailService.sendEmailChangeVerification(email, verificationToken);
      }

      if (Object.keys(updates).length === 0) {
        res.json({
          user: {
            id: req.user!.id,
            username: req.user!.username,
            email: req.user!.email,
            displayName: req.user!.displayName,
            bio: req.user!.bio,
            avatarUrl: req.user!.avatarUrl,
            emailVerified: req.user!.emailVerified,
            lastLoginAt: req.user!.lastLoginAt,
            createdAt: req.user!.createdAt,
            updatedAt: req.user!.updatedAt,
          },
        });
        return;
      }

      const updatedUser = await profileService.updateProfile(userId, updates);

      res.json({
        message: updates.email !== undefined ? 'Profile updated. Please verify your new email address.' : 'Profile updated successfully.',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          displayName: updatedUser.displayName,
          bio: updatedUser.bio,
          avatarUrl: updatedUser.avatarUrl,
          emailVerified: updatedUser.emailVerified,
          lastLoginAt: updatedUser.lastLoginAt,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  uploadAvatar = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const parsed = avatarSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0].message });
        return;
      }

      const { avatarUrl } = parsed.data;
      const updatedUser = await profileService.updateAvatar(userId, avatarUrl);

      res.json({
        message: 'Avatar updated successfully',
        avatarUrl: updatedUser.avatarUrl,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          displayName: updatedUser.displayName,
          bio: updatedUser.bio,
          avatarUrl: updatedUser.avatarUrl,
          emailVerified: updatedUser.emailVerified,
          lastLoginAt: updatedUser.lastLoginAt,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
      });
    } catch (error) {
      console.error('Upload avatar error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = changePasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0].message });
        return;
      }

      const { currentPassword, newPassword, confirmNewPassword } = parsed.data;

      if (newPassword !== confirmNewPassword) {
        res.status(400).json({ error: 'New passwords do not match' });
        return;
      }

      const isPasswordValid = await authService.comparePassword(currentPassword, req.user!.passwordHash);
      if (!isPasswordValid) {
        res.status(400).json({ error: 'Current password is incorrect' });
        return;
      }

      const newHash = await authService.hashPassword(newPassword);
      await authService.updatePassword(req.user!.id, newHash);

      res.json({ message: 'Password changed successfully. Please log in again.' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export const profileController = new ProfileController();
