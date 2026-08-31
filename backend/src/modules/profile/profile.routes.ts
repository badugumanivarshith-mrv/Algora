import { Router } from 'express';
import { profileController } from './profile.controller';
import { protect } from '../auth/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', profileController.getProfile);
router.patch('/', profileController.updateProfile);
router.post('/avatar', profileController.uploadAvatar);
router.post('/change-password', profileController.changePassword);

export default router;
