const UsageLog = require('../models/UsageLog');
const Item = require('../models/Item');
const Request = require('../models/Request');

// Get monthly usage report
const getMonthlyUsage = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    let matchQuery = {
      dateUsed: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    };
    
    // Filter by department for staff
    if (req.user.role === 'staff') {
      matchQuery.department = req.user.department;
    }

    const monthlyData = await UsageLog.aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: {
            month: { $month: '$dateUsed' },
            year: { $year: '$dateUsed' }
          },
          totalUsed: { $sum: '$quantityUsed' },
          requestCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.month': 1 }
      }
    ]);

    // Fill in missing months with zero values
    const months = [];
    for (let i = 1; i <= 12; i++) {
      const monthData = monthlyData.find(data => data._id.month === i);
      months.push({
        month: i,
        monthName: new Date(year, i - 1).toLocaleString('default', { month: 'long' }),
        totalUsed: monthData ? monthData.totalUsed : 0,
        requestCount: monthData ? monthData.requestCount : 0
      });
    }

    res.json({
      success: true,
      data: { monthlyData: months }
    });
  } catch (error) {
    console.error('Get monthly usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get department-wise distribution
const getDepartmentDistribution = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - parseInt(months), 1);

    let matchQuery = {
      dateUsed: { $gte: startDate }
    };
    
    // Filter by department for staff
    if (req.user.role === 'staff') {
      matchQuery.department = req.user.department;
    }

    const departmentData = await UsageLog.aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: '$department',
          totalUsed: { $sum: '$quantityUsed' },
          requestCount: { $sum: 1 },
          uniqueItems: { $addToSet: '$itemId' }
        }
      },
      {
        $project: {
          department: '$_id',
          totalUsed: 1,
          requestCount: 1,
          uniqueItemCount: { $size: '$uniqueItems' }
        }
      },
      {
        $sort: { totalUsed: -1 }
      }
    ]);

    // Calculate percentages
    const totalUsed = departmentData.reduce((sum, dept) => sum + dept.totalUsed, 0);
    departmentData.forEach(dept => {
      dept.percentage = totalUsed > 0 ? Math.round((dept.totalUsed / totalUsed) * 100) : 0;
    });

    res.json({
      success: true,
      data: { departmentData }
    });
  } catch (error) {
    console.error('Get department distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get category-wise distribution
const getCategoryDistribution = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - parseInt(months), 1);

    let matchQuery = {
      dateUsed: { $gte: startDate }
    };
    
    // Filter by department for staff
    if (req.user.role === 'staff') {
      matchQuery.department = req.user.department;
    }

    const categoryData = await UsageLog.aggregate([
      {
        $match: matchQuery
      },
      {
        $lookup: {
          from: 'items',
          localField: 'itemId',
          foreignField: '_id',
          as: 'item'
        }
      },
      {
        $unwind: '$item'
      },
      {
        $group: {
          _id: '$item.category',
          totalUsed: { $sum: '$quantityUsed' },
          requestCount: { $sum: 1 },
          uniqueItems: { $addToSet: '$itemId' }
        }
      },
      {
        $project: {
          category: '$_id',
          totalUsed: 1,
          requestCount: 1,
          uniqueItemCount: { $size: '$uniqueItems' }
        }
      },
      {
        $sort: { totalUsed: -1 }
      }
    ]);

    // Calculate percentages
    const totalUsed = categoryData.reduce((sum, cat) => sum + cat.totalUsed, 0);
    categoryData.forEach(cat => {
      cat.percentage = totalUsed > 0 ? Math.round((cat.totalUsed / totalUsed) * 100) : 0;
    });

    res.json({
      success: true,
      data: { categoryData }
    });
  } catch (error) {
    console.error('Get category distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get request status distribution
const getRequestStatusDistribution = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - parseInt(months), 1);

    let matchQuery = {
      requestedDate: { $gte: startDate }
    };
    
    // Filter by department for staff
    if (req.user.role === 'staff') {
      matchQuery.department = req.user.department;
    }

    const statusData = await Request.aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Calculate percentages
    const totalRequests = statusData.reduce((sum, status) => sum + status.count, 0);
    statusData.forEach(status => {
      status.percentage = totalRequests > 0 ? Math.round((status.count / totalRequests) * 100) : 0;
    });

    res.json({
      success: true,
      data: { statusData }
    });
  } catch (error) {
    console.error('Get request status distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get comprehensive dashboard report
const getDashboardReport = async (req, res) => {
  try {
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const last3Months = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
    const last6Months = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1);

    // Get basic statistics
    const totalItems = await Item.countDocuments({ isActive: true });
    const outOfStockItems = await Item.countDocuments({ isActive: true, quantity: 0 });
    const lowStockItems = await Item.countDocuments({
      isActive: true,
      $expr: { $lte: ['$quantity', '$minStockLevel'] }
    });

    // Get request statistics
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const approvedRequests = await Request.countDocuments({ status: 'approved' });

    // Get usage statistics
    const lastMonthUsage = await UsageLog.aggregate([
      {
        $match: {
          dateUsed: { $gte: lastMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalUsed: { $sum: '$quantityUsed' },
          requestCount: { $sum: 1 }
        }
      }
    ]);

    const last3MonthsUsage = await UsageLog.aggregate([
      {
        $match: {
          dateUsed: { $gte: last3Months }
        }
      },
      {
        $group: {
          _id: null,
          totalUsed: { $sum: '$quantityUsed' },
          requestCount: { $sum: 1 }
        }
      }
    ]);

    // Get top departments
    const topDepartments = await UsageLog.aggregate([
      {
        $match: {
          dateUsed: { $gte: last6Months }
        }
      },
      {
        $group: {
          _id: '$department',
          totalUsed: { $sum: '$quantityUsed' }
        }
      },
      {
        $sort: { totalUsed: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get top categories
    const topCategories = await UsageLog.aggregate([
      {
        $match: {
          dateUsed: { $gte: last6Months }
        }
      },
      {
        $lookup: {
          from: 'items',
          localField: 'itemId',
          foreignField: '_id',
          as: 'item'
        }
      },
      {
        $unwind: '$item'
      },
      {
        $group: {
          _id: '$item.category',
          totalUsed: { $sum: '$quantityUsed' }
        }
      },
      {
        $sort: { totalUsed: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalItems,
          outOfStockItems,
          lowStockItems,
          totalRequests,
          pendingRequests,
          approvedRequests,
          lastMonthUsage: lastMonthUsage[0] || { totalUsed: 0, requestCount: 0 },
          last3MonthsUsage: last3MonthsUsage[0] || { totalUsed: 0, requestCount: 0 }
        },
        topDepartments,
        topCategories
      }
    });
  } catch (error) {
    console.error('Get dashboard report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Export data for PDF generation
const exportData = async (req, res) => {
  try {
    const { type, months = 6 } = req.query;
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - parseInt(months), 1);

    let exportData = {};

    switch (type) {
      case 'usage':
        const usageData = await UsageLog.find({ dateUsed: { $gte: startDate } })
          .populate('itemId', 'name category department')
          .populate('userId', 'name email')
          .sort({ dateUsed: -1 });
        exportData = { usageData };
        break;

      case 'requests':
        const requestData = await Request.find({ requestedDate: { $gte: startDate } })
          .populate('itemId', 'name category')
          .populate('userId', 'name email department')
          .populate('approvedBy', 'name')
          .sort({ requestedDate: -1 });
        exportData = { requestData };
        break;

      case 'inventory':
        const inventoryData = await Item.find({ isActive: true }).sort({ name: 1 });
        exportData = { inventoryData };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getMonthlyUsage,
  getDepartmentDistribution,
  getCategoryDistribution,
  getRequestStatusDistribution,
  getDashboardReport,
  exportData
}; 