const mongoose = require('mongoose');
const { seedInitialData } = require('../utils/seeder');

const connectDB = async () => {
  const mongodbUri = process.env.MONGODB_URI;
  
  if (mongodbUri && mongodbUri !== 'mongodb://127.0.0.1:27017/paytracker') {
    // If a custom URI is configured, connect to it
    try {
      console.log(`Connecting to configured MongoDB at ${mongodbUri}...`);
      await mongoose.connect(mongodbUri, { serverSelectionTimeoutMS: 5000 });
      console.log('Successfully connected to MongoDB.');
      await seedInitialData();
    } catch (err) {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    }
  } else {
    // Connect to local MongoDB with short timeout, fallback to MongoMemoryServer
    try {
      console.log('Attempting connection to local MongoDB (mongodb://127.0.0.1:27017)...');
      await mongoose.connect('mongodb://127.0.0.1:27017/paytracker', { serverSelectionTimeoutMS: 2000 });
      console.log('Successfully connected to local MongoDB.');
      await seedInitialData();
    } catch (err) {
      console.log('Local MongoDB not running. Launching in-memory MongoDB server...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        console.log(`In-memory MongoDB started at: ${uri}`);
        await mongoose.connect(uri);
        console.log('Successfully connected to In-Memory MongoDB.');
        await seedInitialData();
      } catch (memErr) {
        console.error('Failed to start in-memory MongoDB:', memErr);
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
