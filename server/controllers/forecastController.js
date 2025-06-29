const UsageLog = require('../models/UsageLog');
const Item = require('../models/Item');
const Request = require('../models/Request');

// Get forecast data for items
const getForecast = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - parseInt(months), 1);

    // Get items based on user role and department
    let itemsQuery = { isActive: true };
    if (req.user.role === 'staff') {
      itemsQuery.department = req.user.department;
    }
    
    const items = await Item.find(itemsQuery);

    const forecastData = [];

    for (const item of items) {
      // Get historical usage for the item
      let usageHistoryQuery = {
        itemId: item._id,
        dateUsed: { $gte: startDate }
      };
      
      // Filter by department for staff
      if (req.user.role === 'staff') {
        usageHistoryQuery.department = req.user.department;
      }

      const usageHistory = await UsageLog.aggregate([
        {
          $match: usageHistoryQuery
        },
        {
          $group: {
            _id: {
              year: { $year: '$dateUsed' },
              month: { $month: '$dateUsed' }
            },
            totalUsed: { $sum: '$quantityUsed' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]);

      // Calculate average monthly usage
      const totalUsage = usageHistory.reduce((sum, record) => sum + record.totalUsed, 0);
      const averageMonthlyUsage = usageHistory.length > 0 ? totalUsage / usageHistory.length : 0;

      // Predict next month's usage (simple moving average)
      const predictedUsage = Math.ceil(averageMonthlyUsage);

      // Calculate stock risk
      let stockRisk = 'low';
      if (item.quantity === 0) {
        stockRisk = 'critical';
      } else if (item.quantity <= item.minStockLevel) {
        stockRisk = 'high';
      } else if (item.quantity <= predictedUsage) {
        stockRisk = 'medium';
      }

      // Calculate days until stockout
      let daysUntilStockout = null;
      if (averageMonthlyUsage > 0) {
        daysUntilStockout = Math.floor((item.quantity / averageMonthlyUsage) * 30);
      }

      forecastData.push({
        item: {
          id: item._id,
          name: item.name,
          category: item.category,
          department: item.department,
          currentStock: item.quantity,
          minStockLevel: item.minStockLevel
        },
        usageHistory,
        averageMonthlyUsage,
        predictedUsage,
        stockRisk,
        daysUntilStockout,
        recommendation: getRecommendation(item.quantity, predictedUsage, item.minStockLevel)
      });
    }

    // Sort by stock risk (critical first)
    forecastData.sort((a, b) => {
      const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return riskOrder[a.stockRisk] - riskOrder[b.stockRisk];
    });

    res.json({
      success: true,
      data: {
        forecast: forecastData,
        summary: {
          totalItems: forecastData.length,
          criticalRisk: forecastData.filter(item => item.stockRisk === 'critical').length,
          highRisk: forecastData.filter(item => item.stockRisk === 'high').length,
          mediumRisk: forecastData.filter(item => item.stockRisk === 'medium').length,
          lowRisk: forecastData.filter(item => item.stockRisk === 'low').length
        }
      }
    });
  } catch (error) {
    console.error('Get forecast error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get top used items
const getTopUsedItems = async (req, res) => {
  try {
    const { months = 3, limit = 10 } = req.query;
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - parseInt(months), 1);

    let matchQuery = {
      dateUsed: { $gte: startDate }
    };
    
    // Filter by department for staff
    if (req.user.role === 'staff') {
      matchQuery.department = req.user.department;
    }

    const topItems = await UsageLog.aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: '$itemId',
          totalUsed: { $sum: '$quantityUsed' },
          usageCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalUsed: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: 'items',
          localField: '_id',
          foreignField: '_id',
          as: 'item'
        }
      },
      {
        $unwind: '$item'
      },
      {
        $project: {
          item: {
            id: '$item._id',
            name: '$item.name',
            category: '$item.category',
            department: '$item.department',
            currentStock: '$item.quantity'
          },
          totalUsed: 1,
          usageCount: 1,
          averagePerUse: { $divide: ['$totalUsed', '$usageCount'] }
        }
      }
    ]);

    res.json({
      success: true,
      data: { topItems }
    });
  } catch (error) {
    console.error('Get top used items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get department-wise usage analysis
const getDepartmentUsage = async (req, res) => {
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

    const departmentUsage = await UsageLog.aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: '$department',
          totalUsed: { $sum: '$quantityUsed' },
          usageCount: { $sum: 1 },
          uniqueItems: { $addToSet: '$itemId' }
        }
      },
      {
        $project: {
          department: '$_id',
          totalUsed: 1,
          usageCount: 1,
          uniqueItemCount: { $size: '$uniqueItems' },
          averagePerUse: { $divide: ['$totalUsed', '$usageCount'] }
        }
      },
      {
        $sort: { totalUsed: -1 }
      }
    ]);

    res.json({
      success: true,
      data: { departmentUsage }
    });
  } catch (error) {
    console.error('Get department usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get seasonal trends
const getSeasonalTrends = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const monthlyUsage = await UsageLog.aggregate([
      {
        $match: {
          dateUsed: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$dateUsed' },
            category: '$category'
          },
          totalUsed: { $sum: '$quantityUsed' }
        }
      },
      {
        $group: {
          _id: '$_id.month',
          categories: {
            $push: {
              category: '$_id.category',
              totalUsed: '$totalUsed'
            }
          },
          totalUsed: { $sum: '$totalUsed' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.json({
      success: true,
      data: { monthlyUsage }
    });
  } catch (error) {
    console.error('Get seasonal trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to get recommendation
const getRecommendation = (currentStock, predictedUsage, minStockLevel) => {
  if (currentStock === 0) {
    return 'URGENT: Restock immediately';
  }
  
  if (currentStock <= minStockLevel) {
    return 'HIGH PRIORITY: Restock soon';
  }
  
  if (currentStock <= predictedUsage) {
    return 'MEDIUM PRIORITY: Consider restocking';
  }
  
  if (currentStock <= predictedUsage * 1.5) {
    return 'LOW PRIORITY: Monitor stock levels';
  }
  
  return 'SUFFICIENT: Stock levels are adequate';
};

module.exports = {
  getForecast,
  getTopUsedItems,
  getDepartmentUsage,
  getSeasonalTrends
}; 