const express = require('express');
const router = express.Router();
const { 
  getForecast, 
  getTopUsedItems 
} = require('../controllers/forecastController');
const { auth } = require('../middleware/auth');

// Get forecast data for all items
router.get('/', auth, getForecast);

// Get top used items
router.get('/top-used', auth, getTopUsedItems);

module.exports = router; 