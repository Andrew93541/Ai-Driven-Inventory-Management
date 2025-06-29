const Item = require('../models/Item');

// Get all items with filtering and pagination
const getItems = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      department, 
      stockStatus 
    } = req.query;

    const query = { isActive: true };

    // Department-based filtering
    if (req.user.role === 'staff') {
      // Staff can only see items from their department
      query.department = req.user.department;
    } else if (department && req.user.role === 'admin') {
      // Admin can filter by any department
      query.department = department;
    }

    // Search filter
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Stock status filter
    if (stockStatus) {
      if (stockStatus === 'out_of_stock') {
        query.quantity = 0;
      } else if (stockStatus === 'low_stock') {
        query.$expr = { $lte: ['$quantity', '$minStockLevel'] };
      } else if (stockStatus === 'in_stock') {
        query.$expr = { $gt: ['$quantity', '$minStockLevel'] };
      }
    }

    const skip = (page - 1) * limit;
    
    const items = await Item.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Item.countDocuments(query);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single item by ID
const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check department access
    if (req.user.role === 'staff' && item.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view items from your department.'
      });
    }

    res.json({
      success: true,
      data: { item }
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new item
const createItem = async (req, res) => {
  try {
    const {
      name,
      category,
      quantity,
      department,
      description,
      unit,
      minStockLevel,
      maxStockLevel,
      location
    } = req.body;

    // Department validation for staff
    if (req.user.role === 'staff' && department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only create items for your department.'
      });
    }

    const item = new Item({
      name,
      category,
      quantity,
      department: req.user.role === 'staff' ? req.user.department : department,
      description,
      unit,
      minStockLevel,
      maxStockLevel,
      location
    });

    await item.save();

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: { item }
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
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
        message: 'Access denied. You can only update items from your department.'
      });
    }

    // Prevent staff from changing department
    if (req.user.role === 'staff' && req.body.department && req.body.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot change the department of an item.'
      });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: { item: updatedItem }
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete item (soft delete)
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Only admin can delete items
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can delete items.'
      });
    }

    const deletedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get low stock alerts
const getLowStockAlerts = async (req, res) => {
  try {
    const items = await Item.find({
      isActive: true,
      $expr: { $lte: ['$quantity', '$minStockLevel'] }
    }).sort({ quantity: 1 });

    res.json({
      success: true,
      data: { items }
    });
  } catch (error) {
    console.error('Get low stock alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get item statistics
const getItemStats = async (req, res) => {
  try {
    const totalItems = await Item.countDocuments({ isActive: true });
    const outOfStock = await Item.countDocuments({ isActive: true, quantity: 0 });
    const lowStock = await Item.countDocuments({
      isActive: true,
      $expr: { $lte: ['$quantity', '$minStockLevel'] }
    });

    const categoryStats = await Item.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const departmentStats = await Item.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalItems,
        outOfStock,
        lowStock,
        categoryStats,
        departmentStats
      }
    });
  } catch (error) {
    console.error('Get item stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getLowStockAlerts,
  getItemStats
}; 