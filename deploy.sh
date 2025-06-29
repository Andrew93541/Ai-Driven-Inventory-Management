#!/bin/bash

echo "🚀 AI Inventory System Deployment Script"
echo "========================================"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit for deployment"
    echo "✅ Git repository initialized"
fi

echo ""
echo "📋 Deployment Options:"
echo "1. Render.com (Recommended - Free)"
echo "2. Railway.app (Free)"
echo "3. Vercel (Free)"
echo "4. DigitalOcean App Platform (Free)"
echo "5. Heroku (Paid - $7/month)"
echo ""

read -p "Choose your deployment platform (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🎯 Deploying to Render.com"
        echo "=========================="
        echo "1. Go to https://render.com and sign up"
        echo "2. Click 'New +' and select 'Web Service'"
        echo "3. Connect your GitHub repository"
        echo "4. Configure:"
        echo "   - Name: ai-inventory-system"
        echo "   - Environment: Node"
        echo "   - Build Command: npm install"
        echo "   - Start Command: npm start"
        echo "   - Plan: Free"
        echo ""
        echo "5. Add Environment Variables:"
        echo "   - NODE_ENV=production"
        echo "   - MONGODB_URI=your_mongodb_atlas_connection_string"
        echo "   - JWT_SECRET=your_super_secret_jwt_key"
        echo ""
        echo "6. Click 'Create Web Service'"
        echo ""
        echo "Your server will be available at: https://your-app-name.onrender.com"
        ;;
    2)
        echo ""
        echo "🚂 Deploying to Railway.app"
        echo "==========================="
        echo "1. Go to https://railway.app and sign up"
        echo "2. Connect your GitHub repository"
        echo "3. Railway will auto-detect Node.js"
        echo "4. Add environment variables in Railway dashboard"
        echo "5. Deploy automatically"
        ;;
    3)
        echo ""
        echo "⚡ Deploying to Vercel"
        echo "======================"
        echo "1. Go to https://vercel.com and sign up"
        echo "2. Import your GitHub repository"
        echo "3. Vercel will auto-detect Node.js"
        echo "4. Add environment variables in Vercel dashboard"
        echo "5. Deploy"
        ;;
    4)
        echo ""
        echo "🐳 Deploying to DigitalOcean App Platform"
        echo "========================================="
        echo "1. Go to https://digitalocean.com and create account"
        echo "2. Go to App Platform"
        echo "3. Connect your repository"
        echo "4. Configure as Node.js app"
        echo "5. Add environment variables"
        echo "6. Deploy"
        ;;
    5)
        echo ""
        echo "🦸 Deploying to Heroku"
        echo "======================"
        echo "1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli"
        echo "2. Run these commands:"
        echo "   cd server"
        echo "   heroku create your-app-name"
        echo "   heroku config:set NODE_ENV=production"
        echo "   heroku config:set MONGODB_URI=your_mongodb_connection_string"
        echo "   heroku config:set JWT_SECRET=your_secret_key"
        echo "   git push heroku main"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "📝 Next Steps:"
echo "1. Deploy your backend using the instructions above"
echo "2. Test your API: https://your-app-url/health"
echo "3. Deploy your frontend (optional):"
echo "   - GitHub Pages: Push client folder to separate repo"
echo "   - Netlify: Drag and drop client folder"
echo "   - Vercel: Import frontend code"
echo ""
echo "🔗 Update your frontend API URL to point to your deployed backend"
echo "📚 See DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
echo "✅ Deployment script completed!" 