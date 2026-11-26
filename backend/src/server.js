import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const app = createApp();

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
