const express = require('express');
const router = express.Router();
const { 
  getMonthlyUsage, 
  getDepartmentDistribution, 
  getCategoryDistribution, 
  getRequestStatusDistribution, 
  getDashboardReport, 
  exportData 
} = require('../controllers/reportController');
const { auth } = require('../middleware/auth');

// Get monthly usage report
router.get('/monthly-usage', auth, getMonthlyUsage);

// Get department-wise distribution
router.get('/department-distribution', auth, getDepartmentDistribution);

// Get category-wise distribution
router.get('/category-distribution', auth, getCategoryDistribution);

// Get request status distribution
router.get('/request-status', auth, getRequestStatusDistribution);

// Get comprehensive dashboard report
router.get('/dashboard', auth, getDashboardReport);

// Export data for PDF generation
router.get('/export', auth, exportData);

module.exports = router; 