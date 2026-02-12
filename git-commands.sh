#!/bin/bash

echo "🚀 Git Commands for Ant Design X Suite"
echo "======================================="
echo ""

echo "1️⃣ Initialize repository..."
git init
echo ""

echo "2️⃣ Configure user..."
git config user.name "sheikhcoders"
git config user.email "sheikhcoders@gmail.com"
echo ""

echo "3️⃣ Add all files..."
git add .
echo ""

echo "4️⃣ Create commit..."
git commit -m "Initial commit: Ant Design X Suite with Ant Design X components

- Web Application with React 19 and Ant Design X
- Documentation Site with @ant-design/x-markdown  
- AI Chat Interface with @ant-design/x-sdk
- CSS Variables theming system
- TypeScript support
- Vite build configuration
- Docker deployment support
- GitHub Actions CI/CD"
echo ""

echo "5️⃣ Rename branch to main..."
git branch -M main
echo ""

echo "6️⃣ Add remote origin..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/sheikhcoders/ant-design-x-suite.git
echo ""

echo "7️⃣ Push to GitHub..."
echo "   Enter your GitHub Personal Access Token when prompted"
echo ""
read -p "Press Enter to continue with push..."

git push -u origin main

echo ""
echo "✅ Complete! Repository: https://github.com/sheikhcoders/ant-design-x-suite"