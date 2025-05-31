import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/arabic-novel-writer';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.warn('MongoDB connection failed, running in demo mode without database:', error instanceof Error ? error.message : String(error));
    // Don't exit the process, continue without database for demo purposes
  }
};