# Ant Design X Suite

A comprehensive AI-powered application suite built with Ant Design X components.

## Features

- 🌐 **Web Application** - Modern UI with React 19 and Ant Design X
- 📚 **Documentation Site** - Markdown-based documentation with @ant-design/x-markdown
- 🤖 **AI Chat Interface** - AI-powered chat with @ant-design/x-sdk integration

## Tech Stack

- React 19 + TypeScript
- Vite 5
- Ant Design X 2.2.2
- Ant Design 6.3.0
- CSS Variables Theming

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Atomic design components
│   ├── atoms/          # Basic UI elements
│   ├── molecules/      # Component combinations
│   ├── organisms/      # Complex components
│   └── templates/      # Page layouts
├── features/           # Feature-based modules
│   ├── web-app/        # Main web application
│   ├── docs-site/      # Documentation site
│   └── ai-app/         # AI-powered application
├── hooks/              # Custom React hooks
├── services/           # API and data services
├── utils/              # Utility functions
├── types/              # TypeScript definitions
├── styles/             # Global styles and themes
├── app.tsx
└── index.tsx
```

## Git Setup

### Initialize Repository

```bash
git init
git add .
git commit -m "Initial commit: Ant Design X Suite"
```

### Add Remote and Push

```bash
git remote add origin https://github.com/sheikhcoders/ant-design-x-suite.git
git branch -M main
git push -u origin main
```

### Configure Git User

```bash
git config user.name "sheikhcoders"
git config user.email "sheikhcoders@gmail.com"
```

Or set globally:

```bash
git config --global user.name "sheikhcoders"
git config --global user.email "sheikhcoders@gmail.com"
```

## Hugging Face Spaces Deployment

### Option 1: Direct Upload

1. Create a new Space on Hugging Face: https://huggingface.co/new-space
2. Select "Static" as the Space SDK
3. Upload the contents of the `dist/` folder
4. Set the file to serve as `index.html`

### Option 2: Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Option 3: GitHub Actions Deployment

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_KEY=your-api-key
VITE_MODEL_NAME=gpt-4
VITE_API_ENDPOINT=https://api.openai.com/v1
```

## License

MIT

## Author

- GitHub: [@sheikhcoders](https://github.com/sheikhcoders)
- Email: sheikhcoders@gmail.com