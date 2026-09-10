import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas cluster if MONGODB_URI is provided.
 * Gracefully operates in memory/fallback mode if MONGODB_URI is omitted.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pocketmentor';
  const isLocal = uri.includes('127.0.0.1') || uri.includes('localhost');

  if (!process.env.MONGODB_URI && (process.env.RENDER || process.env.NODE_ENV === 'production')) {
    console.warn('⚠️ [CRITICAL CLOUD CONFIGURATION NOTICE]');
    console.warn('⚠️ Running in cloud (Render) without MONGODB_URI environment variable!');
    console.warn('⚠️ Render cannot connect to 127.0.0.1 (local laptop). Please add MONGODB_URI to Render dashboard.');
  }

  const connectOptions = {
    serverSelectionTimeoutMS: 6000
  };
  if (isLocal) {
    connectOptions.family = 4;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, connectOptions);
    console.log(`🍃 MongoDB: Connected successfully to ${isLocal ? 'local MongoDB database (pocketmentor)' : 'MongoDB cluster'}`);
    return true;
  } catch (error) {
    // If remote or custom URI failed, try local MongoDB fallback
    if (uri !== 'mongodb://127.0.0.1:27017/pocketmentor') {
      try {
        console.warn('⚠️ Custom MONGODB_URI failed, attempting local MongoDB server...');
        await mongoose.connect('mongodb://127.0.0.1:27017/pocketmentor', {
          serverSelectionTimeoutMS: 3000,
          family: 4
        });
        console.log('🍃 MongoDB: Connected to local MongoDB database (pocketmentor)');
        return true;
      } catch (localErr) {
        console.warn('⚠️ Local MongoDB connection also failed:', localErr.message);
      }
    }
    console.warn('⚠️ MongoDB Connection Warning:', error.message);
    console.log('⚡ Continuing in resilient local fallback mode');
    return false;
  }
}
