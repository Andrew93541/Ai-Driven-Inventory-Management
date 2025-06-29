const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired.' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error.' 
    });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. Admin privileges required.' 
        });
      }
      next();
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error.' 
    });
  }
};

// Department-based access control middleware
const departmentAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      // Admin has access to all departments
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Staff can only access their own department
      if (req.user.role === 'staff') {
        const requestedDepartment = req.params.department || req.body.department || req.query.department;
        
        if (requestedDepartment && requestedDepartment !== req.user.department) {
          return res.status(403).json({ 
            success: false, 
            message: 'Access denied. You can only access your own department.' 
          });
        }
        
        return next();
      }
      
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient privileges.' 
      });
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error.' 
    });
  }
};

// Role-based permission middleware
const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      await auth(req, res, () => {
        if (!allowedRoles.includes(req.user.role)) {
          return res.status(403).json({ 
            success: false, 
            message: 'Access denied. Insufficient privileges.' 
          });
        }
        next();
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Server error.' 
      });
    }
  };
};

// Permission-based middleware for CRUD operations
const canCreate = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      // Admin can create anything
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Staff can only create items for their department
      if (req.user.role === 'staff') {
        const itemDepartment = req.body.department;
        if (itemDepartment && itemDepartment !== req.user.department) {
          return res.status(403).json({ 
            success: false, 
            message: 'Access denied. You can only create items for your own department.' 
          });
        }
        return next();
      }
      
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient privileges.' 
      });
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error.' 
    });
  }
};

const canUpdate = async (req, res, next) => {
  try {
    await auth(req, res, async () => {
      // Admin can update anything
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Staff can only update items from their department
      if (req.user.role === 'staff') {
        const item = await require('../models/Item').findById(req.params.id);
        if (!item) {
          return res.status(404).json({ 
            success: false, 
            message: 'Item not found.' 
          });
        }
        
        if (item.department !== req.user.department) {
          return res.status(403).json({ 
            success: false, 
            message: 'Access denied. You can only update items from your own department.' 
          });
        }
        return next();
      }
      
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient privileges.' 
      });
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error.' 
    });
  }
};

const canDelete = async (req, res, next) => {
  try {
    await auth(req, res, async () => {
      // Only admin can delete
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. Only administrators can delete items.' 
        });
      }
      next();
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error.' 
    });
  }
};

module.exports = { 
  auth, 
  adminAuth, 
  departmentAuth, 
  requireRole, 
  canCreate, 
  canUpdate, 
  canDelete 
}; 