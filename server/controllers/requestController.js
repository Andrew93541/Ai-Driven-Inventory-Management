const Request = require('../models/Request');
const Item = require('../models/Item');
const User = require('../models/User');

// Get all requests with filtering and pagination
const getRequests = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      department,
      userId 
    } = req.query;

    const query = {};

    // Department-based filtering
    if (req.user.role === 'staff') {
      // Staff can only see requests from their department
      query.department = req.user.department;
    } else if (department && req.user.role === 'admin') {
      // Admin can filter by any department
      query.department = department;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // User filter (for staff to see only their requests)
    if (req.user.role === 'staff') {
      query.userId = req.user._id;
    } else if (userId && req.user.role === 'admin') {
      query.userId = userId;
    }

    const skip = (page - 1) * limit;
    
    const requests = await Request.find(query)
      .populate('itemId', 'name category')
      .populate('userId', 'name email')
      .populate('approvedBy', 'name')
      .sort({ requestedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Request.countDocuments(query);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single request by ID
const getRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('itemId', 'name category quantity')
      .populate('userId', 'name email department')
      .populate('approvedBy', 'name');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check department access for staff
    if (req.user.role === 'staff' && request.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view requests from your department.'
      });
    }

    // Staff can only view their own requests
    if (req.user.role === 'staff' && request.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own requests.'
      });
    }

    res.json({
      success: true,
      data: { request }
    });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new request
const createRequest = async (req, res) => {
  try {
    const {
      itemId,
      quantity,
      reason,
      priority,
      notes
    } = req.body;

    // Check if item exists and has sufficient stock
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check department access for staff
    if (req.user.role === 'staff' && item.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only request items from your department.'
      });
    }

    if (item.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    const request = new Request({
      itemId,
      userId: req.user._id,
      quantity,
      reason,
      priority,
      notes,
      department: req.user.department
    });

    await request.save();

    // Populate the request with item and user details
    await request.populate('itemId', 'name category');
    await request.populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      data: { request }
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Approve request (admin only)
const approveRequest = async (req, res) => {
  try {
    const { adminReason } = req.body;
    const requestId = req.params.id;

    // Only admin can approve requests
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can approve requests.'
      });
    }

    const request = await Request.findById(requestId)
      .populate('itemId');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request is not pending'
      });
    }

    // Check if item still has sufficient stock
    if (request.itemId.quantity < request.quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    // Update request status
    request.status = 'approved';
    request.adminReason = adminReason;
    request.approvedDate = new Date();
    request.approvedBy = req.user._id;

    // Update item quantity
    request.itemId.quantity -= request.quantity;
    await request.itemId.save();

    await request.save();

    res.json({
      success: true,
      message: 'Request approved successfully',
      data: { request }
    });

  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Decline request
const declineRequest = async (req, res) => {
  try {
    const { adminReason } = req.body;
    const requestId = req.params.id;

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request is not pending'
      });
    }

    request.status = 'declined';
    request.adminReason = adminReason;
    request.approvedDate = new Date();
    request.approvedBy = req.user._id;

    await request.save();

    res.json({
      success: true,
      message: 'Request declined successfully',
      data: { request }
    });
  } catch (error) {
    console.error('Decline request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Complete request (mark as completed)
const completeRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Request is not approved'
      });
    }

    request.status = 'completed';
    await request.save();

    res.json({
      success: true,
      message: 'Request marked as completed',
      data: { request }
    });
  } catch (error) {
    console.error('Complete request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get request statistics
const getRequestStats = async (req, res) => {
  try {
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const approvedRequests = await Request.countDocuments({ status: 'approved' });
    const declinedRequests = await Request.countDocuments({ status: 'declined' });

    const departmentStats = await Request.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    const statusStats = await Request.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalRequests,
        pendingRequests,
        approvedRequests,
        declinedRequests,
        departmentStats,
        statusStats
      }
    });
  } catch (error) {
    console.error('Get request stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getRequests,
  getRequest,
  createRequest,
  approveRequest,
  declineRequest,
  completeRequest,
  getRequestStats
}; 