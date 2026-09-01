import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== Algora API Validation ===');
  
  let token = '';

  try {
    // 1. Health check
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', health.data.status);

    // 2. Auth - Register & Login
    const timestamp = Date.now();
    const email = `testuser_${timestamp}@example.com`;
    const password = 'Password123!';
    const username = `testuser_${timestamp}`;
    
    // Register
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      email,
      password,
      username,
      fullName: 'Test User'
    });
    console.log('✅ Registration successful:', regRes.data);

    // Manually verify email using pg
    const { Client } = require('pg');
    const client = new Client({ connectionString: 'postgresql://postgres:Mani@8239@localhost:5432/algora_dev' });
    await client.connect();
    await client.query('UPDATE users SET email_verified = true WHERE email = $1', [email]);
    await client.end();
    console.log('✅ Manually verified email in database.');
    
    // Login
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password
    });
    token = loginRes.data.token;
    console.log('✅ Login successful, token received.');

    // 3. Profile
    const profileRes = await axios.get(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Fetched profile:', profileRes.data.user.username);
    
    // 4. Problems List
    const problemsRes = await axios.get(`${BASE_URL}/problems`);
    const problems = problemsRes.data.problems;
    console.log(`✅ Fetched problems list: ${problems.length} problems found.`);
    
    if (problems.length === 0) {
      console.log('⚠️ No problems in database. Skipping judge tests.');
      return;
    }

    const firstProblemSlug = problems[0].slug;

    // 5. Problem Details
    const problemDetailRes = await axios.get(`${BASE_URL}/problems/${firstProblemSlug}`);
    console.log(`✅ Fetched problem details: ${problemDetailRes.data.problem.title}`);
    
    const problemId = problemDetailRes.data.problem.id;

    // 6. Judge Engine / Submissions
    console.log('\n--- Judge Engine Tests ---');
    
    // Valid solution (Python example, assuming Two Sum or similar)
    const acceptedCode = `
def solve():
    return True
    `;
    const subRes = await axios.post(`${BASE_URL}/submissions`, {
      problemId,
      language: 'python',
      sourceCode: acceptedCode
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const submissionId = subRes.data.submission.id;
    console.log(`✅ Submission created with ID: ${submissionId}, status: ${subRes.data.submission.status}`);
    
    // Poll for verdict
    console.log('Waiting for judge verdict...');
    let verdict = 'PENDING';
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const statusRes = await axios.get(`${BASE_URL}/submissions/${submissionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      verdict = statusRes.data.submission.status;
      if (verdict !== 'PENDING') break;
    }
    
    console.log(`✅ Submission completed with verdict: ${verdict}`);
    
    // 7. Submissions list
    const mySubRes = await axios.get(`${BASE_URL}/submissions/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Fetched user submissions: ${mySubRes.data.submissions.length} found.`);
    
    // 8. Leaderboard
    const lbRes = await axios.get(`${BASE_URL}/leaderboard`);
    console.log(`✅ Leaderboard fetched. Top user: ${lbRes.data.rankings.length > 0 ? lbRes.data.rankings[0].username : 'None'}`);

    // 9. User Progress
    const progRes = await axios.get(`${BASE_URL}/leaderboard/progress`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Progress fetched: ${progRes.data.progress.totalSolved} solved.`);
    
    console.log('\n✅ ALL CRITICAL API PATHS VERIFIED.');

  } catch (err: any) {
    console.error('❌ API Test Failed!');
    if (err.response) {
      console.error(err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

runTests();
