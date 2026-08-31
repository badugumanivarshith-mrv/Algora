import express from 'express';
import cors from 'cors';
import healthRouter from './modules/health/health.routes';
import authRouter from './modules/auth/auth.routes';
import profileRouter from './modules/profile/profile.routes';

import { env } from './config/env';

const app = express();

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);

app.get('/api/system/email-status', (req, res) => {
  const provider = env.EMAIL_PROVIDER;
  const apiKey = env.RESEND_API_KEY || '';
  const configured = provider === 'resend' && apiKey.startsWith('re_');
  const sender = env.EMAIL_FROM;
  const apiKeyValidFormat = apiKey.startsWith('re_');

  res.json({
    provider,
    configured,
    sender,
    apiKeyValidFormat,
  });
});

// Basic global error handler
app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
