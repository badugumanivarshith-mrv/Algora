import express from 'express';
import cors from 'cors';
import healthRouter from './modules/health/health.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api/health', healthRouter);

// Basic global error handler
app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
