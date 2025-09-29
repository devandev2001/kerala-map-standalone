#!/bin/bash

echo "🚀 Force Deploying Kerala Map v1.8.0 to Vercel..."

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Create a small change to force deployment
    echo "🔄 Creating deployment trigger..."
    echo "<!-- Deployment trigger: $(date) -->" >> public/map/pan.html
    
    # Commit the trigger
    git add public/map/pan.html
    git commit -m "Force deployment trigger - $(date)"
    git push standalone main
    
    echo "✅ Code pushed to GitHub!"
    echo "🌐 Vercel should auto-deploy in 1-2 minutes"
    echo "🔍 Check your domain: https://mission2025.vikasitakeralam.in"
    echo "📋 Look for version log: 'Kerala Map v1.8.0' in browser console"
else
    echo "❌ Build failed. Please check the errors above."
fi
