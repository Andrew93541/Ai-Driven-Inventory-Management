# 🚀 MongoDB Setup Guide

## Option 1: MongoDB Atlas (Recommended - Free Cloud Database)

### Step 1: Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/atlas
2. Click "Try Free"
3. Create your account

### Step 2: Create a Cluster

1. Choose "FREE" tier (M0)
2. Select your preferred cloud provider (AWS/Google Cloud/Azure)
3. Choose a region close to you
4. Click "Create"

### Step 3: Set Up Database Access

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Username: `admin`
4. Password: `admin123`
5. Role: "Atlas admin"
6. Click "Add User"

### Step 4: Set Up Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 5: Get Your Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string

### Step 6: Update Your .env File

Create a file called `.env` in the server folder:

```env
PORT=5000
MONGODB_URI=mongodb+srv://admin:admin123@your-cluster-url.mongodb.net/ai_inventory?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
```

Replace `your-cluster-url` with your actual cluster URL from Step 5.

## Option 2: Install MongoDB Locally

### Windows:

1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer
3. Start MongoDB service

### macOS:

```bash
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu):

```bash
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
```

## Test Your Connection

After setting up MongoDB, run:

```bash
npm run seed
```

You should see:

```
✅ Database seeding completed successfully!
```

## Troubleshooting

- **Connection refused**: MongoDB is not running
- **Authentication failed**: Check username/password in connection string
- **Network timeout**: Check your internet connection and firewall settings
