const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection & Fallback Setup
const startDatabase = async () => {
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

startDatabase();

// 1. Database Schema
const transactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  merchantName: { type: String, required: true },
  date: { type: Date, required: true },
  category: {
    type: String,
    enum: ['Food', 'Bills', 'Education', 'Entertainment', 'Shopping', 'Others'],
    default: 'Others'
  },
  paymentMode: {
    type: String,
    enum: ['UPI', 'Credit Card', 'Debit Card', 'Cash'],
    default: 'UPI'
  },
  isAIGenerated: { type: Boolean, default: true }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Multer Config for Memory Storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit: 5MB
});

// Helper: Clean and Parse JSON from Gemini response
function parseGeminiJSON(rawText) {
  let cleaned = rawText.trim();
  
  // Strip markdown ```json code block if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```$/, '');
  }
  
  try {
    const parsed = JSON.parse(cleaned.trim());
    
    // Normalize properties to prevent mongoose validation issues
    const normalized = {
      amount: Number(parsed.amount) || 0,
      merchantName: parsed.merchantName || 'Unknown Merchant',
      date: parsed.date ? new Date(parsed.date) : new Date(),
      category: ['Food', 'Bills', 'Education', 'Entertainment', 'Shopping', 'Others'].includes(parsed.category)
        ? parsed.category
        : 'Others',
      paymentMode: ['UPI', 'Credit Card', 'Debit Card', 'Cash'].includes(parsed.paymentMode)
        ? parsed.paymentMode
        : 'UPI',
      isAIGenerated: true
    };

    // If date is invalid, fallback to current date
    if (isNaN(normalized.date.getTime())) {
      normalized.date = new Date();
    }

    return normalized;
  } catch (error) {
    console.error('Failed to parse Gemini output as JSON. Raw text:', rawText);
    throw new Error('Could not parse response from Gemini. Please try again.');
  }
}

// 2. API Endpoints

// POST /api/transactions/scan: Scan a receipt/statement and save
app.post('/api/transactions/scan', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image or PDF statement.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.'
      });
    }

    // Initialize Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Prepare content parts for Gemini
    const filePart = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype
      }
    };

    const prompt = "Analyze this payment screenshot or bank statement. Extract the total transaction amount, merchant or receiver name, payment date, and infer the category (Food, Bills, Education, Entertainment, Shopping, Others) and payment mode. Return ONLY a valid, minified JSON object matching this structure: { amount: number, merchantName: string, date: string (YYYY-MM-DD), category: string, paymentMode: string }. Do not include markdown tags.";

    console.log(`Sending file (${req.file.mimetype}, size: ${req.file.size} bytes) to Gemini API...`);
    const result = await model.generateContent([prompt, filePart]);
    const responseText = result.response.text();
    console.log('Gemini API Response received:', responseText);

    // Clean and Parse JSON
    const transactionData = parseGeminiJSON(responseText);

    // Save to Database
    const newTransaction = new Transaction(transactionData);
    const savedTransaction = await newTransaction.save();

    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error('Error processing scan:', error);
    res.status(500).json({ error: error.message || 'Error occurred during receipt scanning.' });
  }
});

// POST /api/transactions: Manually create a new transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const { amount, merchantName, date, category, paymentMode } = req.body;
    
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Please enter a valid amount.' });
    }
    if (!merchantName || !merchantName.trim()) {
      return res.status(400).json({ error: 'Please enter a merchant/receiver name.' });
    }
    if (!date) {
      return res.status(400).json({ error: 'Please select a date.' });
    }

    const newTransaction = new Transaction({
      amount: Number(amount),
      merchantName: merchantName.trim(),
      date: new Date(date),
      category: category || 'Others',
      paymentMode: paymentMode || 'UPI',
      isAIGenerated: false
    });

    console.log(newTransaction);
    return;

    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error('Error creating manual transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction.' });
  }
});

// GET /api/transactions: Fetch all transactions sorted by date (newest first)
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to retrieve transactions.' });
  }
});

// PUT /api/transactions/:id: Update transaction for manual corrections
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { amount, merchantName, date, category, paymentMode, isAIGenerated } = req.body;
    
    // Normalize fields
    const updateData = {
      amount: Number(amount),
      merchantName,
      date: new Date(date),
      category,
      paymentMode,
      isAIGenerated: isAIGenerated !== undefined ? isAIGenerated : false
    };

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction.' });
  }
});

// DELETE /api/transactions/:id: Delete transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }
    res.status(200).json({ message: 'Transaction deleted successfully.', id: req.params.id });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction.' });
  }
});

// Seed data function to populate dashboard on fresh start
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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
