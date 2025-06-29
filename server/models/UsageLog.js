const mongoose = require('mongoose');

const UsageLogSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Item ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  quantityUsed: {
    type: Number,
    required: [true, 'Quantity used is required'],
    min: [1, 'Quantity used must be at least 1']
  },
  dateUsed: {
    type: Date,
    default: Date.now
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  purpose: {
    type: String,
    trim: true
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
UsageLogSchema.index({ itemId: 1, dateUsed: -1 });
UsageLogSchema.index({ department: 1, dateUsed: -1 });
UsageLogSchema.index({ dateUsed: 1 });

// Virtual for month and year
UsageLogSchema.virtual('month').get(function() {
  return this.dateUsed.getMonth() + 1;
});

UsageLogSchema.virtual('year').get(function() {
  return this.dateUsed.getFullYear();
});

// Ensure virtual fields are serialized
UsageLogSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('UsageLog', UsageLogSchema); 