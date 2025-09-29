#!/bin/bash

echo "🚀 Deploying Kerala Map to Vercel..."

# Build the project
echo "📦 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Try to deploy with Vercel CLI
    echo "🌐 Deploying to Vercel..."
    vercel --prod --yes
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployment successful!"
        echo "🌐 Your app should be live at: https://mission2025.vikasitakeralam.in"
    else
        echo "❌ Vercel deployment failed. Please check your Vercel configuration."
        echo "💡 Alternative: Push to GitHub and let Vercel auto-deploy"
    fi
else
    echo "❌ Build failed. Please check the errors above."
fi
