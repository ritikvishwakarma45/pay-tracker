const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

async function runTest() {
  try {
    // Connect to database (either Atlas or MongoMemoryServer)
    await connectDB();

    console.log('--- Cleaning test data ---');
    await User.deleteMany({ email: 'test_user@example.com' });

    console.log('--- Testing User Registration & Password Hashing ---');
    const user = await User.create({
      name: 'Test User',
      email: 'test_user@example.com',
      password: 'password123'
    });
    console.log('User created with ID:', user._id);
    console.log('Hashed Password:', user.password);
    
    if (user.password === 'password123') {
      throw new Error('Password hashing failed - stored as plain text!');
    }
    console.log('Password hash test passed.');

    console.log('--- Testing Password Matching ---');
    const isMatch = await user.matchPassword('password123');
    const isFailMatch = await user.matchPassword('wrong_password');
    console.log('Password match validation (correct):', isMatch);
    console.log('Password match validation (incorrect):', isFailMatch);
    
    if (!isMatch || isFailMatch) {
      throw new Error('Password matching comparison helper failed!');
    }
    console.log('Password match test passed.');

    console.log('--- Testing Transaction Scoping ---');
    const tx = await Transaction.create({
      amount: 100,
      merchantName: 'Test Merchant',
      date: new Date(),
      category: 'Others',
      paymentMode: 'Cash',
      userId: user._id
    });
    console.log('Transaction created with ID:', tx._id);
    console.log('Associated userId:', tx.userId);

    const fetchedTx = await Transaction.find({ userId: user._id });
    console.log('Fetched transactions count:', fetchedTx.length);
    if (fetchedTx.length === 0 || fetchedTx[0].merchantName !== 'Test Merchant') {
      throw new Error('Transaction query scoping failed!');
    }
    console.log('Transaction scoping test passed.');

    // Cleanup
    await User.deleteMany({ email: 'test_user@example.com' });
    await Transaction.deleteMany({ userId: user._id });
    console.log('--- Cleanup done. All tests passed! ---');
    
    // Disconnect Mongoose to exit clean
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
}

runTest();
