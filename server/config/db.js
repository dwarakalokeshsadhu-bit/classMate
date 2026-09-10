import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas cluster if MONGODB_URI is provided.
 * Gracefully operates in memory/fallback mode if MONGODB_URI is omitted.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<password>') || uri.includes('your_mongodb_uri')) {
    console.log('🍃 MongoDB Atlas: Not configured (running in local session mode)');
    return false;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: false // Don't enforce unique indexes
    });
    console.log('🍃 MongoDB Atlas: Connected successfully to cluster');
    return true;
  } catch (error) {
    console.warn('⚠️ MongoDB Atlas Connection Warning:', error.message);
    console.log('⚡ Continuing in resilient local fallback mode');
    return false;
  }
}
