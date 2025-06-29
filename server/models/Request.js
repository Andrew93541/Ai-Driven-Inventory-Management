const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
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
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined', 'completed'],
    default: 'pending'
  },
  reason: {
    type: String,
    required: [true, 'Reason for request is required'],
    trim: true
  },
  adminReason: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  requestedDate: {
    type: Date,
    default: Date.now
  },
  approvedDate: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
RequestSchema.index({ status: 1, requestedDate: -1 });
RequestSchema.index({ userId: 1 });
RequestSchema.index({ itemId: 1 });

// Virtual for request age
RequestSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.requestedDate) / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
RequestSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Request', RequestSchema); 