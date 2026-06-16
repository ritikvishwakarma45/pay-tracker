const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { analyzeReceipt, generateChatResponse } = require('../utils/groqHelper');


// @desc    Scan receipt and save transaction
// @route   POST /api/transactions/scan
// @access  Private
const scanTransaction = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image or PDF statement.' });
    }

    // Call Groq helper to analyze receipt
    const transactionData = await analyzeReceipt(req.file.buffer, req.file.mimetype);

    // Save to Database with associated userId
    const newTransaction = new Transaction({
      ...transactionData,
      userId: req.user
    });
    const savedTransaction = await newTransaction.save();

    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error('Error processing scan:', error);
    res.status(500).json({ error: error.message || 'Error occurred during receipt scanning.' });
  }
};

// @desc    Manually create a new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
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
      userId: req.user,
      isAIGenerated: false
    });

    console.log('Manually inserting transaction for user:', req.user, newTransaction);

    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error('Error creating manual transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction.' });
  }
};

// @desc    Fetch all transactions for logged in user sorted by date (newest first)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to retrieve transactions.' });
  }
};

// @desc    Update transaction for manual corrections
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const { amount, merchantName, date, category, paymentMode, isAIGenerated } = req.body;
    
    // Find transaction and verify ownership
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }
    if (transaction.userId.toString() !== req.user.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this transaction.' });
    }

    // Normalize and update fields
    transaction.amount = Number(amount);
    transaction.merchantName = merchantName;
    transaction.date = new Date(date);
    transaction.category = category;
    transaction.paymentMode = paymentMode;
    transaction.isAIGenerated = isAIGenerated !== undefined ? isAIGenerated : false;

    const updated = await transaction.save();
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction.' });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    // Find transaction and verify ownership
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }
    if (transaction.userId.toString() !== req.user.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this transaction.' });
    }

    await Transaction.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Transaction deleted successfully.', id: req.params.id });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction.' });
  }
};

// @desc    Export transactions as CSV
// @route   GET /api/transactions/export
// @access  Private
const exportTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user }).sort({ date: -1 });
    
    // Define headers
    const headers = ['Amount', 'Merchant Name', 'Date', 'Category', 'Payment Mode', 'AI Generated'];
    const rows = transactions.map(t => [
      t.amount,
      `"${t.merchantName.replace(/"/g, '""')}"`,
      new Date(t.date).toISOString().split('T')[0],
      t.category,
      t.paymentMode,
      t.isAIGenerated ? 'Yes' : 'No'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=paytracker_transactions.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting transactions:', error);
    res.status(500).json({ error: 'Failed to export transactions.' });
  }
};

// @desc    Chat with AI financial assistant
// @route   POST /api/transactions/chat
// @access  Private
const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Please enter a message.' });
    }

    // Fetch user transactions
    const transactions = await Transaction.find({ userId: req.user }).sort({ date: -1 });

    // Fetch user details for budget limit
    const user = await User.findById(req.user);
    const budgetLimit = user && user.budgetLimit !== undefined ? user.budgetLimit : 40000;

    // Generate response from Groq
    const responseText = await generateChatResponse(message.trim(), transactions, budgetLimit);

    res.status(200).json({ response: responseText });
  } catch (error) {
    console.error('Error in AI Chat controller:', error);
    res.status(500).json({ error: error.message || 'Failed to communicate with AI Assistant.' });
  }
};

const scanBulkTransactions = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Please upload at least one image or PDF statement.' });
    }

    const results = [];
    for (const file of req.files) {
      try {
        const transactionData = await analyzeReceipt(file.buffer, file.mimetype);
        const newTransaction = new Transaction({
          ...transactionData,
          userId: req.user
        });
        const savedTransaction = await newTransaction.save();
        results.push({
          success: true,
          fileName: file.originalname,
          transaction: savedTransaction
        });
      } catch (err) {
        console.error(`Failed to process bulk scan for file ${file.originalname}:`, err);
        results.push({
          success: false,
          fileName: file.originalname,
          error: err.message || 'Parsing failed.'
        });
      }
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('Error in bulk scanning controller:', error);
    res.status(500).json({ error: error.message || 'Error occurred during bulk scanning.' });
  }
};

module.exports = {
  scanTransaction,
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  exportTransactions,
  chatWithAI,
  scanBulkTransactions
};

