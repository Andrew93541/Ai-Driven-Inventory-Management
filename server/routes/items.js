const express = require('express');
const router = express.Router();
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getLowStockAlerts,
  getItemStats
} = require('../controllers/itemController');
const { 
  auth, 
  requireRole, 
  canCreate, 
  canUpdate, 
  canDelete 
} = require('../middleware/auth');

// Get all items (with filtering and pagination)
router.get('/', auth, getItems);

// Get single item by ID
router.get('/:id', auth, getItem);

// Create new item (admin and staff can create)
router.post('/', canCreate, createItem);

// Update item (admin and staff can update their department items)
router.put('/:id', canUpdate, updateItem);

// Delete item (admin only)
router.delete('/:id', canDelete, deleteItem);

// Get low stock alerts (filtered by department for staff)
router.get('/alerts/low-stock', auth, getLowStockAlerts);

// Get item statistics (filtered by department for staff)
router.get('/stats/overview', auth, getItemStats);

module.exports = router; 