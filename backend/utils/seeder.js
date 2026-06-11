const Transaction = require('../models/Transaction');
const User = require('../models/User');

async function seedInitialData() {
  try {
    // 1. Ensure a default demo user exists
    let demoUser = await User.findOne({ email: 'alex@company.com' });
    
    if (!demoUser) {
      console.log('Seeding default user (Alex)...');
      demoUser = await User.create({
        name: 'Alex',
        email: 'alex@company.com',
        password: 'password123' // This will be hashed automatically by the User schema pre-save hook
      });
      console.log('Default user (Alex) created.');
    }

    // 2. Seed initial transactions for the default user if the collection is empty
    const transactionCount = await Transaction.countDocuments();
    if (transactionCount === 0) {
      console.log('Transaction collection is empty. Seeding initial transactions for Alex...');
      
      const today = new Date();
      const yesterday = new Date(new Date().setDate(today.getDate() - 1));
      const twoDaysAgo = new Date(new Date().setDate(today.getDate() - 2));
      const threeDaysAgo = new Date(new Date().setDate(today.getDate() - 3));
      const fourDaysAgo = new Date(new Date().setDate(today.getDate() - 4));
      const tenDaysAgo = new Date(new Date().setDate(today.getDate() - 10));

      const seedTransactions = [
        {
          amount: 450,
          merchantName: 'Blue Bottle Coffee',
          date: today,
          category: 'Food',
          paymentMode: 'UPI',
          userId: demoUser._id,
          isAIGenerated: true
        },
        {
          amount: 850,
          merchantName: 'Uber Ride',
          date: yesterday,
          category: 'Others',
          paymentMode: 'Credit Card',
          userId: demoUser._id,
          isAIGenerated: true
        },
        {
          amount: 3200,
          merchantName: 'Whole Foods Market',
          date: twoDaysAgo,
          category: 'Shopping',
          paymentMode: 'Debit Card',
          userId: demoUser._id,
          isAIGenerated: true
        },
        {
          amount: 1450,
          merchantName: 'Reliance Smart',
          date: threeDaysAgo,
          category: 'Shopping',
          paymentMode: 'UPI',
          userId: demoUser._id,
          isAIGenerated: false
        },
        {
          amount: 12000,
          merchantName: 'Airtel Broadband Annual',
          date: fourDaysAgo,
          category: 'Bills',
          paymentMode: 'Credit Card',
          userId: demoUser._id,
          isAIGenerated: true
        },
        {
          amount: 25000,
          merchantName: 'Coursera Subscription',
          date: tenDaysAgo,
          category: 'Education',
          paymentMode: 'Debit Card',
          userId: demoUser._id,
          isAIGenerated: true
        },
        {
          amount: 650,
          merchantName: 'Netflix India',
          date: tenDaysAgo,
          category: 'Entertainment',
          paymentMode: 'UPI',
          userId: demoUser._id,
          isAIGenerated: true
        }
      ];

      await Transaction.insertMany(seedTransactions);
      console.log('Demo transactions seeded successfully under Alex.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

module.exports = { seedInitialData };
