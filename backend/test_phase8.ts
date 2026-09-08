import axios from 'axios';
import { db } from './src/db';
import { users, userStreaks, userXp, achievements, userAchievements, solvedProblems, submissions, executionJobs } from './src/db/schema';
import { eq, and } from 'drizzle-orm';
import { ProgressService } from './src/modules/progress/progress.service';
import { AchievementsService } from './src/modules/achievements/achievements.service';
import { workerProcessor } from './src/workers/worker.processor';
import { seedDatabase } from './src/db/seed';
import app from './src/app';
import { Server } from 'http';

const BASE_URL = 'http://localhost:5000/api';

async function runPhase8Tests() {
  console.log('\n======================================================');
  console.log('🧪 PHASE 8: PROGRESS ANALYTICS & GAMIFICATION TEST SUITE');
  console.log('======================================================\n');

  let server: Server | null = null;
  try {
    // Start local express server if not running
    server = await new Promise<Server>((resolve, reject) => {
      const s = app.listen(5000, () => resolve(s));
      s.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          console.log('Port 5000 already in use, using running server instance.');
          resolve(null as any);
        } else {
          reject(err);
        }
      });
    });
  } catch (e) {
    // ignore
  }

  try {
    // 1. Ensure database seed
    console.log('[1/6] Running seed check...');
    await seedDatabase();
    console.log('  ✅ Seed completed.');

    // 2. Unit Test: Progress & Streak Calculations
    console.log('\n[2/6] Testing Progress & Streak Engine Logic...');
    const timestamp = Date.now();
    const testUsername = `p8_user_${timestamp}`;
    const testEmail = `p8_user_${timestamp}@example.com`;

    // Create test user directly in DB for unit testing
    const [testUser] = await db.insert(users).values({
      username: testUsername,
      email: testEmail,
      passwordHash: 'hashed_pw',
      emailVerified: true,
    }).returning();

    console.log(`  Created test user: ID ${testUser.id}`);

    // Streak initial
    const streakRes1 = await ProgressService.handleLoginStreak(testUser.id);
    console.log('  Streak initial login:', streakRes1);
    if (streakRes1.streak !== 1) throw new Error('Initial streak should be 1');

    // Same day streak update -> should remain 1
    const streakRes2 = await ProgressService.handleLoginStreak(testUser.id);
    console.log('  Streak same-day login:', streakRes2);
    if (streakRes2.streak !== 1) throw new Error('Same day streak should remain 1');

    // Simulate consecutive day (1 day ago)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await db.update(userStreaks).set({ lastActiveDate: yesterday }).where(eq(userStreaks.userId, testUser.id));

    const streakRes3 = await ProgressService.handleLoginStreak(testUser.id);
    console.log('  Streak consecutive-day login:', streakRes3);
    if (streakRes3.streak !== 2) throw new Error('Consecutive day streak should be 2');

    // Simulate missed days (3 days ago)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    await db.update(userStreaks).set({ lastActiveDate: threeDaysAgo }).where(eq(userStreaks.userId, testUser.id));

    const streakRes4 = await ProgressService.handleLoginStreak(testUser.id);
    console.log('  Streak missed-days login:', streakRes4);
    if (streakRes4.streak !== 1) throw new Error('Missed days streak should reset to 1');

    // XP and Level calculation formula test
    const xpResult1 = await ProgressService.addXp(testUser.id, 100);
    console.log('  Added 100 XP:', xpResult1); // 100 XP -> level 2
    if (xpResult1.level !== 2) throw new Error('100 XP should yield Level 2');

    const xpResult2 = await ProgressService.addXp(testUser.id, 300);
    console.log('  Added 300 XP (Total 400 XP):', xpResult2); // 400 XP -> level 3
    if (xpResult2.level !== 3) throw new Error('400 XP should yield Level 3');

    console.log('  ✅ Streak & XP Engine unit tests PASSED.');

    // 3. Unit Test: Achievement Idempotency
    console.log('\n[3/6] Testing Achievement Unlocks & Idempotency...');
    // Seed solved problem to trigger "First Steps" achievement
    const problemList = await db.select().from(solvedProblems).where(eq(solvedProblems.userId, testUser.id));
    if (problemList.length === 0) {
      await db.insert(solvedProblems).values({ userId: testUser.id, problemId: 1 });
    }

    const unlocked1 = await AchievementsService.checkAchievements(testUser.id);
    console.log(`  First check unlocked ${unlocked1.length} achievements:`, unlocked1.map(a => a.name));

    const unlocked2 = await AchievementsService.checkAchievements(testUser.id);
    console.log(`  Second check unlocked ${unlocked2.length} achievements (Idempotency check).`);
    if (unlocked2.length !== 0) throw new Error('Second achievement check should unlock 0 additional achievements');

    console.log('  ✅ Achievement Idempotency tests PASSED.');

    // 4. API Endpoints Integration Test
    console.log('\n[4/6] Testing Analytics & Progress API Endpoints via HTTP...');
    
    // Register & Login user for HTTP tests
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      username: `http_${timestamp}`,
      email: `http_${timestamp}@example.com`,
      password: 'Password123!',
      fullName: 'HTTP Test User'
    });
    
    // Manually verify email
    const { Client } = require('pg');
    const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Mani@8239@localhost:5432/algora_dev' });
    await client.connect();
    await client.query('UPDATE users SET email_verified = true WHERE email = $1', [`http_${timestamp}@example.com`]);
    await client.end();

    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: `http_${timestamp}@example.com`,
      password: 'Password123!'
    });
    const token = loginRes.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // Test GET /api/analytics/profile
    const profileApiRes = await axios.get(`${BASE_URL}/analytics/profile`, { headers: authHeaders });
    console.log('  GET /api/analytics/profile:', profileApiRes.data.success ? 'OK' : 'FAIL');
    if (!profileApiRes.data.success || !profileApiRes.data.data.solved) throw new Error('GET /api/analytics/profile failed');

    // Test GET /api/analytics/leaderboard
    const lbApiRes = await axios.get(`${BASE_URL}/analytics/leaderboard?page=1&limit=5`);
    console.log('  GET /api/analytics/leaderboard:', lbApiRes.data.success ? `OK (${lbApiRes.data.data.rankings.length} rankings)` : 'FAIL');
    if (!lbApiRes.data.success || !lbApiRes.data.data.rankings) throw new Error('GET /api/analytics/leaderboard failed');

    // Test GET /api/analytics/activity
    const actApiRes = await axios.get(`${BASE_URL}/analytics/activity`, { headers: authHeaders });
    console.log('  GET /api/analytics/activity:', actApiRes.data.success ? 'OK' : 'FAIL');
    if (!actApiRes.data.success) throw new Error('GET /api/analytics/activity failed');

    // Test GET /api/analytics/achievements
    const achApiRes = await axios.get(`${BASE_URL}/analytics/achievements`, { headers: authHeaders });
    console.log('  GET /api/analytics/achievements:', achApiRes.data.success ? `OK (${achApiRes.data.data.length} achievements)` : 'FAIL');
    if (!achApiRes.data.success) throw new Error('GET /api/analytics/achievements failed');

    console.log('  ✅ Analytics API HTTP Integration tests PASSED.');

    // 5. Judge Worker Integration Test
    console.log('\n[5/6] Testing Judge Worker Processor & Gamification Hooks...');
    const httpUserId = loginRes.data.user.id;

    // Create a valid submission
    const acceptedCode = `
function twoSum(nums, target) {
  const map = {};
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (diff in map) return [map[diff], i];
    map[nums[i]] = i;
  }
  return [];
}
    `;

    const subRes = await axios.post(`${BASE_URL}/submissions`, {
      problemId: 1, // Two Sum
      language: 'javascript',
      sourceCode: acceptedCode
    }, { headers: authHeaders });

    const submissionId = subRes.data.submission.id;
    console.log(`  Created submission ID: ${submissionId}`);

    // Process job using worker processor directly
    const processed = await workerProcessor.processNextJob();
    console.log('  Worker processor result:', processed);

    // Get submission status
    const subCheck = await axios.get(`${BASE_URL}/submissions/${submissionId}`, { headers: authHeaders });
    console.log('  Processed Verdict:', subCheck.data.submission.status);
    if (subCheck.data.submission.status !== 'Accepted') {
      throw new Error(`Expected Accepted verdict, got ${subCheck.data.submission.status}`);
    }

    // Check user XP & solved problems
    const [xpAfterSub] = await db.select().from(userXp).where(eq(userXp.userId, httpUserId));
    console.log(`  User XP after Accepted solution: ${xpAfterSub?.totalXp || 0} XP`);
    if ((xpAfterSub?.totalXp || 0) === 0) {
      throw new Error('Accepted submission should award XP to user!');
    }

    // Verify duplicate submission prevention
    console.log('  Testing duplicate submission XP prevention...');
    const prevXp = xpAfterSub?.totalXp || 0;

    const subRes2 = await axios.post(`${BASE_URL}/submissions`, {
      problemId: 1,
      language: 'javascript',
      sourceCode: acceptedCode
    }, { headers: authHeaders });

    await workerProcessor.processNextJob();

    const [xpAfterSub2] = await db.select().from(userXp).where(eq(userXp.userId, httpUserId));
    console.log(`  User XP after duplicate Accepted solution: ${xpAfterSub2?.totalXp || 0} XP (Previous: ${prevXp})`);

    if ((xpAfterSub2?.totalXp || 0) !== prevXp) {
      throw new Error('Duplicate Accepted solution should NOT award additional problem XP!');
    }

    console.log('  ✅ Judge Worker Integration & Duplicate XP prevention tests PASSED.');

    console.log('\n======================================================');
    console.log('🎉 ALL PHASE 8 PROGRESS & GAMIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('======================================================\n');
    process.exit(0);

  } catch (err: any) {
    console.error('\n❌ Phase 8 Test Suite FAILED:');
    if (err.response) {
      console.error(err.response.data);
    } else {
      console.error(err.message || err);
    }
    process.exit(1);
  }
}

runPhase8Tests();
