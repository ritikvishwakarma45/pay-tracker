const mongoose = require('mongoose');

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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAIGenerated: { type: Boolean, default: true }
});

module.exports = mongoose.model('Transaction', transactionSchema);
