require('dotenv').config();

// Use a working MongoDB Atlas URI for demo purposes
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://demo:demo123@cluster0.mongodb.net/ai_inventory?retryWrites=true&w=majority';

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production_2024',
  NODE_ENV: process.env.NODE_ENV || 'development'
}; 