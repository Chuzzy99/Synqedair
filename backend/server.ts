import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected.');

    const server = app.listen(env.PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${env.PORT}`);
    });

    const shutdown = (signal: string) => {
      console.warn(`${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        await prisma.$disconnect();
        console.log('Database connection closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

void startServer();