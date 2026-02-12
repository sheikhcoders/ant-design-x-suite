#!/bin/bash

# Push to GitHub Script
# Run this script to push your code to GitHub

echo "🚀 Pushing Ant Design X Suite to GitHub..."

# Configure git user (if not already configured)
echo "Configuring git user..."
git config user.name "sheikhcoders"
git config user.email "sheikhcoders@gmail.com"

# Initialize git if not already initialized
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
    git branch -M main
fi

# Add remote origin
echo "Adding remote origin..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/sheikhcoders/ant-design-x-suite.git

# Stage all files
echo "Staging files..."
git add .

# Commit
echo "Creating commit..."
git commit -m "Initial commit: Ant Design X Suite with Ant Design X components

- Web Application with React 19 and Ant Design X
- Documentation Site with @ant-design/x-markdown
- AI Chat Interface with @ant-design/x-sdk
- CSS Variables theming system
- TypeScript support
- Vite build configuration
- Docker deployment support
- GitHub Actions CI/CD"

# Push to GitHub
echo "Pushing to GitHub..."
echo "You may be prompted for your credentials."
echo "Enter your GitHub Personal Access Token when prompted for password"

git push -u origin main

echo "✅ Push complete!"
echo ""
echo "Your repository should now be available at:"
echo "https://github.com/sheikhcoders/ant-design-x-suite"
echo ""
echo "Next steps:"
echo "1. Enable GitHub Pages in repository Settings > Pages"
echo "2. Deploy to Hugging Face Spaces by uploading dist/ folder"
echo "3. Configure GitHub token for CI/CD in repository secrets"