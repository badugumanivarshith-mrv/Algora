import { Router } from 'express';
import { submissionController } from './submission.controller';
import { protect } from '../auth/auth.middleware';

const router = Router();

// Submissions endpoints (all protected)
router.post('/', protect, submissionController.submitSolution);
router.get('/me', protect, submissionController.getMySubmissions);
router.get('/:id', protect, submissionController.getSubmissionById);

export default router;
