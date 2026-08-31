import app from './app';
import { env } from './config/env';
import { seedDatabase } from './db/seed';

const server = app.listen(env.PORT, async () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  console.log(`🔗 Health check available at http://localhost:${env.PORT}/api/health`);
  
  try {
    await seedDatabase();
  } catch (err) {
    console.error('Failed to seed database:', err);
  }
});

// Handle graceful shutdown signals
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
