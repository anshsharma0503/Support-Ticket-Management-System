import mongoose from 'mongoose';

export const connectDB = async (uri) => {
  try {
    const mongoUri = uri || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/support_ticket_system';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    process.exit(1);
  }
};
