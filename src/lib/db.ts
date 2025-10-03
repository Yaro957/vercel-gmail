import mongoose from 'mongoose';

let cachedConnection: typeof mongoose | null = null;

export async function connectToDatabase(mongoUri: string): Promise<typeof mongoose> {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined');
  }

  // Prevent Mongoose from creating multiple connections in serverless
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DB_NAME || undefined,
    });
  }

  cachedConnection = mongoose;
  return mongoose;
}


