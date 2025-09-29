#!/bin/bash

echo "🚀 FORCING CORPORATION WARD FIX DEPLOYMENT - v1.8.2"

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Create deployment trigger
    echo "🔄 Creating deployment trigger..."
    TIMESTAMP=$(date +%s)
    echo "<!-- Corporation ward fix trigger: $TIMESTAMP -->" >> public/map/pan.html
    echo "// Corporation ward fix trigger: $TIMESTAMP" >> src/main.tsx
    
    # Commit and push
    git add .
    git commit -m "FORCE DEPLOY v1.8.2 - Corporation ward fix - $TIMESTAMP"
    git push standalone main
    
    echo "✅ Corporation ward fix deployed!"
    echo "🌐 Vercel should redeploy immediately"
    echo "🔍 Check domain: https://mission2025.vikasitakeralam.in"
    echo "📋 Look for: 'Kerala Map v1.8.2' in console"
    echo "🏛️ Expected: 'Calling showCorporationWards...' for Thrissur mandals"
    echo "⏰ Wait 2-3 minutes for deployment to complete"
else
    echo "❌ Build failed. Please check the errors above."
fi
