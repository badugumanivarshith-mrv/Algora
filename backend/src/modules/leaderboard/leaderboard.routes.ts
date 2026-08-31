import { Router } from 'express';
import { leaderboardController } from './leaderboard.controller';
import { protect } from '../auth/auth.middleware';

const router = Router();

router.get('/', leaderboardController.getLeaderboard);
router.get('/progress', protect, leaderboardController.getUserProgress);

export default router;
