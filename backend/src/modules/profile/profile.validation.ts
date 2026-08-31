import { z } from 'zod';

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(30, { message: 'Username must not exceed 30 characters' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Username can only contain letters, numbers, and underscores',
    })
    .optional(),
  displayName: z
    .string()
    .max(100, { message: 'Display name must not exceed 100 characters' })
    .optional()
    .nullable(),
  bio: z.string().optional().nullable(),
  email: z.string().email({ message: 'Invalid email address format' }).optional(),
});

export const avatarSchema = z.object({
  avatarUrl: z.string().max(512, { message: 'Avatar URL is too long' }).nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: z
    .string()
    .min(8, { message: 'New password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'New password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'New password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'New password must contain at least one number' }),
  confirmNewPassword: z.string().min(1, { message: 'Password confirmation is required' }),
});
