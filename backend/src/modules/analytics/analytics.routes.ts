import { Router } from 'express';
import { AnalyticsService } from './analytics.service';
import { protect } from '../auth/auth.middleware';

const router = Router();

// GET /api/analytics/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const profileData = await AnalyticsService.getUserProfileAnalytics(req.user!.id);
    res.json({ success: true, data: profileData });
  } catch (error) {
    console.error('Analytics profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics profile' });
  }
});

// GET /api/analytics/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';

    const leaderboardData = await AnalyticsService.getLeaderboard({ page, limit, search });
    res.json({ success: true, data: leaderboardData });
  } catch (error) {
    console.error('Analytics leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard analytics' });
  }
});

// GET /api/analytics/activity
router.get('/activity', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const recentActivity = await AnalyticsService.getRecentActivity(req.user!.id, limit);
    res.json({ success: true, data: recentActivity });
  } catch (error) {
    console.error('Analytics activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activity log' });
  }
});

// GET /api/analytics/achievements
router.get('/achievements', protect, async (req, res) => {
  try {
    const achievementsData = await AnalyticsService.getAchievementsWithUserStatus(req.user!.id);
    res.json({ success: true, data: achievementsData });
  } catch (error) {
    console.error('Analytics achievements error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch achievements analytics' });
  }
});

// GET /api/analytics/tags
router.get('/tags', protect, async (req, res) => {
  try {
    const distribution = await AnalyticsService.getSolvedTagsDistribution(req.user!.id);
    res.json({ success: true, data: distribution });
  } catch (error) {
    console.error('Analytics tags error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tags distribution' });
  }
});

// GET /api/analytics
router.get('/', protect, async (req, res) => {
  try {
    const profileData = await AnalyticsService.getUserProfileAnalytics(req.user!.id);
    res.json({ success: true, data: profileData });
  } catch (error) {
    console.error('Analytics get error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export const analyticsRouter = router;
