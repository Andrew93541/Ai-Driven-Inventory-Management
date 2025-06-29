# 🚀 Deployment Guide - Make Your Server Live for 24 Hours

## Option 1: Render.com (Recommended - Free)

### Step 1: Prepare Your Code

1. Make sure all your files are committed to a Git repository (GitHub, GitLab, etc.)
2. Your server is already configured for deployment

### Step 2: Deploy to Render

1. Go to [render.com](https://render.com) and sign up for free
2. Click "New +" and select "Web Service"
3. Connect your Git repository
4. Configure the service:
   - **Name**: `ai-inventory-system`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Set Environment Variables

In Render dashboard, go to your service → Environment → Add Environment Variables:

```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_change_in_production_2024
```

### Step 4: Deploy

Click "Create Web Service" and wait for deployment (usually 2-3 minutes).

Your server will be available at: `https://your-app-name.onrender.com`

## Option 2: Railway.app (Alternative - Free Tier)

1. Go to [railway.app](https://railway.app)
2. Sign up and connect your GitHub repository
3. Railway will automatically detect it's a Node.js app
4. Add environment variables in the Railway dashboard
5. Deploy automatically

## Option 3: Heroku (Paid - $7/month)

1. Install Heroku CLI
2. Run these commands:

```bash
cd server
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_connection_string
heroku config:set JWT_SECRET=your_secret_key
git push heroku main
```

## Option 4: Vercel (Free - Serverless)

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect Node.js
4. Add environment variables in Vercel dashboard
5. Deploy

## Option 5: DigitalOcean App Platform (Free Tier)

1. Go to [digitalocean.com](https://digitalocean.com)
2. Create an account and go to App Platform
3. Connect your repository
4. Configure as Node.js app
5. Add environment variables
6. Deploy

## Environment Variables Setup

Make sure to set these environment variables in your hosting platform:

```env
NODE_ENV=production
PORT=5000 (or let the platform set it)
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_change_in_production_2024
```

## Frontend Deployment

After deploying your backend, you can also deploy your frontend:

### Option A: GitHub Pages (Free)

1. Push your `client` folder to a separate GitHub repository
2. Enable GitHub Pages in repository settings
3. Update the API URL in your frontend to point to your deployed backend

### Option B: Netlify (Free)

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `client` folder
3. Your site will be live instantly

### Option C: Vercel (Free)

1. Go to [vercel.com](https://vercel.com)
2. Import your frontend code
3. Deploy automatically

## Testing Your Deployment

1. **Health Check**: Visit `https://your-app-name.onrender.com/health`
2. **API Test**: Test your login endpoint at `https://your-app-name.onrender.com/api/auth/login`
3. **Frontend**: Update your frontend to use the new API URL

## Important Notes

- **Free tiers** may have limitations (sleep after inactivity, bandwidth limits)
- **Render free tier** sleeps after 15 minutes of inactivity but wakes up on first request
- **Railway free tier** has usage limits
- **Always use environment variables** for sensitive data
- **Update CORS settings** to allow your frontend domain

## Troubleshooting

### Common Issues:

1. **Build fails**: Check if all dependencies are in `package.json`
2. **Environment variables**: Make sure they're set correctly
3. **MongoDB connection**: Ensure your MongoDB Atlas cluster is accessible
4. **CORS errors**: Update CORS settings in `app.js`

### Quick Fix Commands:

```bash
# Check if server is running
curl https://your-app-name.onrender.com/health

# Test API endpoint
curl -X POST https://your-app-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"admin123"}'
```

## Cost Comparison

| Platform     | Free Tier | Paid Plans | Sleep Time |
| ------------ | --------- | ---------- | ---------- |
| Render       | ✅ Yes    | $7/month   | 15 min     |
| Railway      | ✅ Yes    | $5/month   | No         |
| Heroku       | ❌ No     | $7/month   | No         |
| Vercel       | ✅ Yes    | $20/month  | No         |
| DigitalOcean | ✅ Yes    | $5/month   | No         |

**Recommendation**: Start with Render.com for the best free tier experience!
