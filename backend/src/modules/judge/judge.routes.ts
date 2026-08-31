import { Router } from 'express';
import { judgeController } from './judge.controller';
import { protect } from '../auth/auth.middleware';

const router = Router();

// Queue and job endpoints (protected)
router.get('/jobs', protect, judgeController.getJobs);
router.get('/jobs/:id', protect, judgeController.getJobById);
router.get('/submissions/:id/results', protect, judgeController.getSubmissionResults);

export default router;
