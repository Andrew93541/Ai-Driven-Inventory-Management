const express = require('express');
const router = express.Router();
const {
  getRequests,
  getRequest,
  createRequest,
  approveRequest,
  declineRequest,
  completeRequest,
  getRequestStats
} = require('../controllers/requestController');
const { 
  auth, 
  requireRole 
} = require('../middleware/auth');

// Get all requests (with filtering and pagination)
router.get('/', auth, getRequests);

// Get single request by ID
router.get('/:id', auth, getRequest);

// Create new request (staff and admin can create)
router.post('/', auth, createRequest);

// Approve request (admin only)
router.put('/:id/approve', requireRole(['admin']), approveRequest);

// Decline request (admin only)
router.put('/:id/decline', requireRole(['admin']), declineRequest);

// Complete request (mark as completed)
router.put('/:id/complete', auth, completeRequest);

// Get request statistics
router.get('/stats/overview', auth, getRequestStats);

module.exports = router; 