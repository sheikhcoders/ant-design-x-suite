#!/bin/bash

# Complete Git Push Script for Ant Design X Suite
# Run this script locally to push your repository to GitHub

echo "============================================"
echo "  Ant Design X Suite - Git Push"
echo "============================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first:"
    echo "   macOS: brew install git"
    echo "   Ubuntu/Debian: sudo apt install git"
    echo "   Windows: Download from https://git-scm.com/"
    exit 1
fi

echo "✅ Git is installed"

# Navigate to app directory
cd "$(dirname \"$0\")\"
echo "📁 Working directory: $(pwd)"

# Step 1: Initialize git if needed
if [ ! -d .git ]; then
    echo ""
    echo "1️⃣ Initializing git repository..."
    git init
    git branch -M main
else
    echo ""
    echo "1️⃣ Git repository already initialized"
fi

# Step 2: Configure user
echo ""
echo "2️⃣ Configuring git user..."
git config user.name "sheikhcoders"
git config user.email "sheikhcoders@gmail.com"
echo "   User: sheikhcoders"
echo "   Email: sheikhcoders@gmail.com"

# Step 3: Add all files
echo ""
echo "3️⃣ Staging all files..."
git add -A

# Step 4: Create commit
echo ""
echo "4️⃣ Creating commit..."
git commit -m "Initial commit: Ant Design X Suite

🚀 Features:
- Web Application with React 19 and Ant Design X
- Documentation Site with @ant-design/x-markdown
- AI Chat Interface with @ant-design/x-sdk
- CSS Variables theming system
- TypeScript support
- Vite build configuration
- Docker deployment support
- GitHub Actions CI/CD

📦 Dependencies:
- @ant-design/x v2.2.2
- @ant-design/x-markdown v2.2.2
- @ant-design/x-sdk v2.2.2
- antd v6.3.0
- react v19.0.0

🔧 Tools:
- Vite 5
- TypeScript 5
- ESLint + Prettier"

# Step 5: Set remote origin
echo ""
echo "5️⃣ Setting remote origin..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/sheikhcoders/ant-design-x-suite.git
echo "   Remote: https://github.com/sheikhcoders/ant-design-x-suite.git"

# Step 6: Push to GitHub
echo ""
echo "6️⃣ Pushing to GitHub..."
echo "   You'll be prompted for credentials"
echo "   Enter your GitHub Personal Access Token when prompted"
echo ""

# Push with verbose output
git push -u origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "============================================"
    echo "  ✅ Push Successful!"
    echo "============================================"
    echo ""
    echo "🌐 Repository: https://github.com/sheikhcoders/ant-design-x-suite"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Enable GitHub Pages in Settings > Pages"
    echo "   2. Deploy to Hugging Face Spaces"
    echo "   3. Configure GitHub token for CI/CD"
    echo ""
else
    echo ""
    echo "❌ Push failed. Please check your credentials and try again."
    echo "   Make sure the repository exists at:"
    echo "   https://github.com/sheikhcoders/ant-design-x-suite"
    exit 1
fi