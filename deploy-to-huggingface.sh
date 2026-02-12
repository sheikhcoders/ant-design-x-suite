#!/bin/bash

# Deploy to Hugging Face Spaces
# This script prepares and uploads your app to Hugging Face

echo "🚀 Deploying Ant Design X Suite to Hugging Face Spaces..."

# Check if dist exists
if [ ! -d "dist" ]; then
    echo "⚠️  No dist folder found. Building first..."
    npm run build
fi

echo ""
echo "📦 Build contents:"
ls -la dist/
echo ""

echo "📤 Deployment Options:"
echo ""
echo "Option 1: Direct Upload via HF CLI"
echo "   hf-cli login"
echo "   cd dist && hf upload . /spaces/sheikhcoders/ant-design-x-suite --repo-type space"
echo ""
echo "Option 2: Manual Upload"
echo "   1. Go to https://huggingface.co/spaces/new"
echo "   2. Create a new Space (select 'Static' SDK)"
echo "   3. Name: ant-design-x-suite"
echo "   4. Drag and drop all files from dist/ folder"
echo ""
echo "Option 3: Use the huggingfaceSpaces.json file"
echo "   Upload huggingfaceSpaces.json to your Space repository"
echo ""
echo "✅ Your Space configuration is ready in: huggingfaceSpaces.json"
echo ""
echo "🌐 After deployment, your app will be available at:"
echo "   https://huggingface.co/spaces/sheikhcoders/ant-design-x-suite"