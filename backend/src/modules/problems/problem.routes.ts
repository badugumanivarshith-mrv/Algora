import { Router } from 'express';
import { problemController } from './problem.controller';
import { protect } from '../auth/auth.middleware';

const router = Router();

// Public routes
router.get('/', problemController.getProblems);
router.get('/:slug', problemController.getProblemBySlug);

// Protected routes (admin/user)
router.post('/', protect, problemController.createProblem);
router.patch('/:id', protect, problemController.updateProblem);
router.delete('/:id', protect, problemController.deleteProblem);

// Test cases routes (requires authorization to prevent exposing testcases freely to unauthorized clients)
router.get('/:id/testcases', protect, problemController.getTestCases);
router.post('/:id/testcases', protect, problemController.createTestCase);

export default router;
