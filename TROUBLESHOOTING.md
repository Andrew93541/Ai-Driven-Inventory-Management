# 🔧 Server Troubleshooting Guide

## 🚀 Quick Start Commands

```bash
# Navigate to server directory
cd server

# Install dependencies (if not done already)
npm install

# Start the server
npm start

# Or start in development mode with auto-restart
npm run dev
```

## ❌ Common Issues & Solutions

### 1. **MongoDB Connection Error**

**Error**: `MongoDB connection error: connect ECONNREFUSED`

**Solutions**:

#### Option A: Use Local MongoDB

```bash
# Install MongoDB locally
# Windows: Download from mongodb.com
# Mac: brew install mongodb-community
# Linux: sudo apt install mongodb

# Start MongoDB service
# Windows: Start MongoDB service
# Mac/Linux: sudo systemctl start mongod

# Check if MongoDB is running
mongosh
```

#### Option B: Use MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account
3. Create new cluster
4. Get connection string
5. Set environment variable:

```bash
# Windows
set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai_inventory

# Mac/Linux
export MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai_inventory
```

### 2. **Port Already in Use**

**Error**: `EADDRINUSE: address already in use :::5000`

**Solutions**:

```bash
# Find process using port 5000
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000

# Kill the process
# Windows
taskkill /PID <process_id>

# Mac/Linux
kill -9 <process_id>

# Or use different port
set PORT=5001
npm start
```

### 3. **Missing Dependencies**

**Error**: `Cannot find module 'express'`

**Solution**:

```bash
cd server
npm install
```

### 4. **Permission Denied**

**Error**: `EACCES: permission denied`

**Solution**:

```bash
# Windows: Run as Administrator
# Mac/Linux: Use sudo or fix permissions
sudo npm start
```

### 5. **Node.js Version Issues**

**Error**: `SyntaxError: Unexpected token`

**Solution**:

```bash
# Check Node.js version (should be 14+)
node --version

# Update Node.js if needed
# Download from nodejs.org
```

## 🔍 Debug Mode

Enable detailed logging:

```bash
# Set debug environment
set NODE_ENV=development
set DEBUG=*

# Start server
npm start
```

## 📋 Step-by-Step Setup

### 1. **Prerequisites Check**

```bash
# Check Node.js
node --version  # Should be 14+

# Check npm
npm --version

# Check if in correct directory
pwd  # Should be in server folder
```

### 2. **Install Dependencies**

```bash
npm install
```

### 3. **Database Setup**

```bash
# Option A: Local MongoDB
mongod

# Option B: MongoDB Atlas
# Set MONGODB_URI environment variable
```

### 4. **Start Server**

```bash
npm start
```

### 5. **Test Connection**

```bash
# Test health endpoint
curl http://localhost:5000/health

# Or open in browser
http://localhost:5000/health
```

## 🐛 Advanced Debugging

### Check Server Logs

```bash
# Start with verbose logging
DEBUG=* npm start

# Check specific modules
DEBUG=express:* npm start
```

### Test Database Connection

```bash
# Test MongoDB connection
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ai_inventory')
  .then(() => console.log('✅ Connected'))
  .catch(err => console.log('❌ Error:', err.message));
"
```

### Check Environment Variables

```bash
# Windows
echo %MONGODB_URI%
echo %PORT%

# Mac/Linux
echo $MONGODB_URI
echo $PORT
```

## 📞 Getting Help

If you're still having issues:

1. **Check the error message** - Copy the exact error
2. **Check your environment** - Node.js version, OS, etc.
3. **Try the health check** - `http://localhost:5000/health`
4. **Check MongoDB** - Ensure database is accessible
5. **Review logs** - Look for specific error messages

## 🎯 Common Success Indicators

When the server starts successfully, you should see:

```
🚀 Starting AI Inventory System...
📊 Environment: development
🔗 Port: 5000
🗄️ MongoDB URI: mongodb://localhost:27017/ai_inventory
🔌 Connecting to MongoDB...
✅ Connected to MongoDB successfully
🚀 Server running on port 5000
🔗 API Base URL: http://localhost:5000/api
💚 Health Check: http://localhost:5000/health
🎉 Server is ready to accept requests!
```

## 🔗 Useful URLs

- **Health Check**: http://localhost:5000/health
- **API Base**: http://localhost:5000/api
- **Frontend**: http://localhost:8080/client/index.html
- **Test Page**: http://localhost:8080/test-login.html
