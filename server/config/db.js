import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas cluster if MONGODB_URI is provided.
 * Gracefully operates in memory/fallback mode if MONGODB_URI is omitted.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pocketmentor';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });
    console.log(`🍃 MongoDB: Connected successfully to ${uri.includes('127.0.0.1') ? 'local MongoDB database (pocketmentor)' : 'MongoDB cluster'}`);
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
