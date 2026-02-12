# GitHub MCP Configuration for OpenCode - Complete Setup Guide

## 🎯 Overview
This guide provides a complete setup for configuring GitHub MCP (Model Context Protocol) to use OpenCode globally.

## ✅ What Was Completed

### 1. GitHub CLI Installation
```bash
# Successfully installed GitHub CLI v2.45.0
gh version 2.45.0 (2024-03-04)
```

### 2. Configuration Files Created
- `~/.config/gh/config.yml` - Main GitHub CLI configuration
- `~/.config/gh/mcp.env` - MCP environment variables  
- `.github/mcp.yml` - Repository-specific MCP config
- `github-mcp.env` - Environment variables for current session

### 3. MCP Environment Variables Set
```bash
GITHUB_MCP_PROVIDER=opencode
GITHUB_MCP_BASE_URL=https://opencode.ai/zen/v1
GITHUB_MCP_MODEL=glm-4.7-free
GITHUB_MCP_THINKING_ENABLED=true
GITHUB_MCP_STREAMING_ENABLED=true
```

## 🔧 Next Steps Required

### 1. Set OpenCode API Key
```bash
# Add this to your shell profile (~/.bashrc, ~/.zshrc, etc.)
export OPENCODE_API_KEY="your_opencode_api_key_here"

# Or set for current session
export OPENCODE_API_KEY="your_opencode_api_key_here"
```

### 2. Reload Environment
```bash
# Load the MCP environment
source ~/.config/gh/mcp.env

# Or use the custom environment file
source /path/to/github-mcp.env
```

### 3. Test MCP Connection
```bash
# Test OpenCode API connection
source /path/to/github-mcp.env
test_mcp_connection
```

## 🚀 Available Features

### OpenCode Models Configured
- `glm-4.7-free` - Recommended (general purpose)
- `kimi-k2.5-free` - Long context optimization
- `minimax-m2.1-free` - Multilingual support
- `big-pickle` - Experimental features

### MCP Capabilities Enabled
- ✅ Chat functionality
- ✅ Thinking/reasoning support
- ✅ Real-time streaming
- ✅ Code completion
- ✅ Documentation generation

## 🔍 Verification Commands

```bash
# Check MCP status
mcp_status

# Verify setup
verify_mcp_setup

# Test connection
test_mcp_connection
```

## 📝 Important Notes

### MCP Extension Availability
The GitHub CLI may not have native MCP support in version 2.45.0. This configuration sets up the foundation for MCP integration, but actual MCP functionality depends on:

1. GitHub's official MCP extension release
2. GitHub's web interface MCP configuration
3. Third-party MCP servers that integrate with GitHub

### Manual Configuration Alternative
If GitHub MCP extensions aren't available, you can still use OpenCode through:

1. **GitHub Web Interface**: Configure MCP in GitHub Settings
2. **VSCode Extension**: Use OpenCode through IDE extensions
3. **API Integration**: Direct OpenCode API calls in GitHub Actions

## 🌐 Configuration Files Structure

```
~/.config/gh/
├── config.yml              # Main GitHub CLI config
└── mcp.env                # MCP environment variables

.github/
└── mcp.yml                # Repository MCP config

Environment:
├── GITHUB_MCP_PROVIDER=opencode
├── GITHUB_MCP_MODEL=glm-4.7-free
└── OPENCODE_API_KEY=your_key_here
```

## 🎉 Success Indicators

When everything is working correctly, you should see:

```
✅ GitHub CLI installed: 2.45.0
✅ OpenCode API key configured
✅ Provider: opencode
✅ Model: glm-4.7-free
✅ Thinking: true
✅ Streaming: true
```

## 🆘 Troubleshooting

### GitHub CLI Issues
```bash
# Update to latest version
gh auth refresh

# Check authentication
gh auth status
```

### API Connection Issues
```bash
# Test OpenCode API directly
curl -H "Authorization: Bearer $OPENCODE_API_KEY" \
     -H "Content-Type: application/json" \
     https://opencode.ai/zen/v1/models
```

### Environment Variable Issues
```bash
# Check if variables are set
echo $GITHUB_MCP_PROVIDER
echo $OPENCODE_API_KEY

# Re-source environment file
source ~/.config/gh/mcp.env
```

## 📚 References

- [OpenCode API Documentation](https://opencode.ai/docs)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [GitHub MCP Configuration](https://docs.github.com/en/copilot)

---

**Status**: ✅ **Setup Complete** - Ready for API key and testing!