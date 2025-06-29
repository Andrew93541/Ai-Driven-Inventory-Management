# ⚡ Quick Deploy - Get Your Server Live in 5 Minutes

## 🎯 Fastest Option: Render.com (Free)

### Step 1: Prepare Your Code (2 minutes)

1. Create a GitHub repository
2. Upload your entire project folder
3. Make sure your `server` folder contains all the backend files

### Step 2: Deploy to Render (3 minutes)

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `ai-inventory-system`
   - **Root Directory**: `server` (important!)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Set Environment Variables

In Render dashboard → Environment → Add:

```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_2024
```

### Step 4: Deploy

Click "Create Web Service" and wait 2-3 minutes.

**Your server will be live at**: `https://your-app-name.onrender.com`

## 🧪 Test Your Deployment

1. **Health Check**: Visit `https://your-app-name.onrender.com/health`
2. **API Test**: Test login with demo credentials:
   ```bash
   curl -X POST https://your-app-name.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@school.com","password":"admin123"}'
   ```

## 🌐 Deploy Frontend (Optional)

### Option A: GitHub Pages (Free)

1. Create a new GitHub repository for frontend
2. Upload only the `client` folder
3. Go to Settings → Pages → Source: Deploy from branch
4. Your frontend will be at: `https://username.github.io/repo-name`

### Option B: Netlify (Free)

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `client` folder
3. Your site is live instantly!

## 🔧 Update Frontend API URL

After deploying backend, update your frontend to use the new API URL:

In `client/js/auth.js`, the API URL is already configured to work with both local and deployed servers.

## 📱 Access Your Live Site

- **Backend API**: `https://your-app-name.onrender.com`
- **Frontend**: Your deployed frontend URL
- **Demo Login**:
  - Email: `admin@school.com`
  - Password: `admin123`

## ⚠️ Important Notes

- **Free tier sleeps** after 15 minutes of inactivity
- **First request** after sleep takes 10-30 seconds to wake up
- **MongoDB Atlas** must be accessible from Render
- **Environment variables** are required for production

## 🆘 Troubleshooting

### Build Fails?

- Check if `package.json` is in the `server` folder
- Ensure all dependencies are listed

### MongoDB Connection Error?

- Verify your MongoDB Atlas connection string
- Check if IP whitelist allows Render's IPs

### CORS Errors?

- The CORS settings are already configured for common deployment platforms

## 🎉 You're Live!

Your AI-powered inventory system is now accessible 24/7 from anywhere in the world!
