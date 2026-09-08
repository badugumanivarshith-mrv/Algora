import { Router } from 'express';
import { ProgressService } from './progress.service';
import { protect } from '../auth/auth.middleware';

const router = Router();

router.get('/', protect, async (req, res) => {
  try {
    const progress = await ProgressService.getProgress(req.user!.id);
    res.json({ success: true, data: progress });
  } catch (error) {
    console.error('Progress get error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export const progressRouter = router;
