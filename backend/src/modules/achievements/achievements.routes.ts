import { Router } from 'express';
import { AchievementsService } from './achievements.service';
import { protect } from '../auth/auth.middleware';

const router = Router();

router.get('/me', protect, async (req, res) => {
  try {
    const unlocked = await AchievementsService.getUserAchievements(req.user!.id);
    res.json({ success: true, data: unlocked });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const all = await AchievementsService.getAllAchievements();
    res.json({ success: true, data: all });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export const achievementsRouter = router;
