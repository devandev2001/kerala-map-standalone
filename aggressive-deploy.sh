#!/bin/bash

echo "🚀 AGGRESSIVE DEPLOYMENT - Kerala Map v1.8.1"

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Create multiple deployment triggers
    echo "🔄 Creating multiple deployment triggers..."
    
    # Add timestamp to multiple files
    TIMESTAMP=$(date +%s)
    echo "<!-- Deployment trigger 1: $TIMESTAMP -->" >> public/map/pan.html
    echo "// Deployment trigger 2: $TIMESTAMP" >> src/main.tsx
    echo "/* Deployment trigger 3: $TIMESTAMP */" >> src/App.tsx
    
    # Commit all changes
    git add .
    git commit -m "AGGRESSIVE DEPLOY v1.8.1 - Multiple triggers - $TIMESTAMP"
    git push standalone main
    
    echo "✅ Aggressive deployment pushed!"
    echo "🌐 Vercel should redeploy immediately"
    echo "🔍 Check domain: https://mission2025.vikasitakeralam.in"
    echo "📋 Look for: 'Kerala Map v1.8.1' in console"
    echo "⏰ Wait 2-3 minutes for deployment to complete"
else
    echo "❌ Build failed. Please check the errors above."
fi
