const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['electronics', 'furniture', 'books', 'sports', 'lab_equipment', 'office_supplies', 'other']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['lab', 'library', 'hostel', 'sports', 'admin', 'general']
  },
  description: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    default: 'pieces'
  },
  minStockLevel: {
    type: Number,
    default: 5,
    min: [0, 'Minimum stock level cannot be negative']
  },
  maxStockLevel: {
    type: Number,
    min: [0, 'Maximum stock level cannot be negative']
  },
  location: {
    type: String,
    trim: true
  },
  qrCode: {
    type: String,
    unique: true,
    sparse: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
ItemSchema.index({ name: 1, department: 1 });
ItemSchema.index({ category: 1 });
ItemSchema.index({ quantity: 1 });

// Virtual for stock status
ItemSchema.virtual('stockStatus').get(function() {
  if (this.quantity === 0) return 'out_of_stock';
  if (this.quantity <= this.minStockLevel) return 'low_stock';
  return 'in_stock';
});

// Ensure virtual fields are serialized
ItemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Item', ItemSchema); 