const Transaction = require('../models/Transaction');
const { analyzeReceipt } = require('../utils/groqHelper');

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

module.exports = {
  scanTransaction,
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
};
