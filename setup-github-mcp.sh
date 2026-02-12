#!/bin/bash

# GitHub MCP Configuration Script for OpenCode Global Setup

echo "Setting up GitHub MCP for OpenCode Global Configuration..."

# Create GitHub CLI config directory
mkdir -p ~/.config/gh

# Create main GitHub CLI config
cat > ~/.config/gh/config.yml << 'EOF'
git_protocol: https
editor: ""
prompt: enabled
pager: ""
http_unix_socket: ""
browser: ""
# OpenCode MCP Configuration
mcp:
  provider: opencode
  global_config:
    enabled: true
    default_model: glm-4.7-free
    thinking_enabled: true
    streaming_enabled: true
  models:
    - glm-4.7-free
    - kimi-k2.5-free  
    - minimax-m2.1-free
    - big-pickle
  capabilities:
    - chat
    - thinking
    - streaming
    - code_completion
EOF

# Create MCP environment file
cat > ~/.config/gh/mcp.env << 'EOF'
# GitHub MCP Environment Variables for OpenCode
GITHUB_MCP_PROVIDER=opencode
GITHUB_MCP_BASE_URL=https://opencode.ai/zen/v1
GITHUB_MCP_MODEL=glm-4.7-free
GITHUB_MCP_THINKING_ENABLED=true
GITHUB_MCP_STREAMING_ENABLED=true
GITHUB_MCP_API_KEY=${OPENCODE_API_KEY}
GITHUB_MCP_TIMEOUT=30000
GITHUB_MCP_MAX_TOKENS=2000
GITHUB_MCP_TEMPERATURE=0.7
EOF

# Create repository-specific MCP config
mkdir -p .github
cat > .github/mcp.yml << 'EOF'
# Repository-specific MCP Configuration
provider: opencode
default_model: glm-4.7-free
enabled_models:
  - glm-4.7-free
  - kimi-k2.5-free
  - minimax-m2.1-free
capabilities:
  - chat
  - thinking
  - streaming
  - code_completion
  - documentation_generation
environment:
  OPENCODE_API_KEY: ${OPENCODE_API_KEY}
features:
  thinking_display: true
  streaming_output: true
  code_highlighting: true
EOF

# Set environment variables for current session
export GITHUB_MCP_PROVIDER=opencode
export GITHUB_MCP_BASE_URL=https://opencode.ai/zen/v1
export GITHUB_MCP_MODEL=glm-4.7-free
export GITHUB_MCP_THINKING_ENABLED=true
export GITHUB_MCP_STREAMING_ENABLED=true

echo "✅ GitHub MCP Configuration completed!"
echo ""
echo "📋 Configuration Files Created:"
echo "  - ~/.config/gh/config.yml (GitHub CLI main config)"
echo "  - ~/.config/gh/mcp.env (MCP environment variables)"
echo "  - .github/mcp.yml (Repository-specific config)"
echo ""
echo "🔧 Environment Variables Set:"
echo "  - GITHUB_MCP_PROVIDER=opencode"
echo "  - GITHUB_MCP_MODEL=glm-4.7-free"
echo "  - GITHUB_MCP_THINKING_ENABLED=true"
echo "  - GITHUB_MCP_STREAMING_ENABLED=true"
echo ""
echo "📝 Next Steps:"
echo "  1. Set your OpenCode API key: export OPENCODE_API_KEY=your_key_here"
echo "  2. Reload your shell or run: source ~/.config/gh/mcp.env"
echo "  3. Restart GitHub CLI to apply changes"
echo ""
echo "🌐 Available Models:"
echo "  - glm-4.7-free (recommended)"
echo "  - kimi-k2.5-free (long context)"
echo "  - minimax-m2.1-free (multilingual)"
echo "  - big-pickle (experimental)"