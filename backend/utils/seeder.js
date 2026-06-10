const Transaction = require('../models/Transaction');

async function seedInitialData() {
  try {
    const count = await Transaction.countDocuments();
    if (count === 0) {
      console.log('Database is empty. Seeding initial transactions for demo dashboard...');
      
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
          isAIGenerated: true
        },
        {
          amount: 850,
          merchantName: 'Uber Ride',
          date: yesterday,
          category: 'Others',
          paymentMode: 'Credit Card',
          isAIGenerated: true
        },
        {
          amount: 3200,
          merchantName: 'Whole Foods Market',
          date: twoDaysAgo,
          category: 'Shopping',
          paymentMode: 'Debit Card',
          isAIGenerated: true
        },
        {
          amount: 1450,
          merchantName: 'Reliance Smart',
          date: threeDaysAgo,
          category: 'Shopping',
          paymentMode: 'UPI',
          isAIGenerated: false
        },
        {
          amount: 12000,
          merchantName: 'Airtel Broadband Annual',
          date: fourDaysAgo,
          category: 'Bills',
          paymentMode: 'Credit Card',
          isAIGenerated: true
        },
        {
          amount: 25000,
          merchantName: 'Coursera Subscription',
          date: tenDaysAgo,
          category: 'Education',
          paymentMode: 'Debit Card',
          isAIGenerated: true
        },
        {
          amount: 650,
          merchantName: 'Netflix India',
          date: tenDaysAgo,
          category: 'Entertainment',
          paymentMode: 'UPI',
          isAIGenerated: true
        }
      ];

      await Transaction.insertMany(seedTransactions);
      console.log('Demo transactions seeded successfully.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

module.exports = { seedInitialData };
