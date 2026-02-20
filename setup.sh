#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MCP_SERVER_DIR="$SCRIPT_DIR/mcp-server"
CLAUDE_CONFIG="$HOME/.claude.json"
GLOBAL_CLAUDE_MD="$HOME/.claude/CLAUDE.md"

echo "=== KnowledgeBase MCP Server Setup ==="
echo ""

# 1. Install dependencies
echo "Installing dependencies..."
cd "$MCP_SERVER_DIR"
npm install --silent
echo "  Done."
echo ""

# 2. Register MCP server globally in ~/.claude.json
echo "Registering MCP server in Claude Code..."

SERVER_ENTRY="{\"command\":\"node\",\"args\":[\"$MCP_SERVER_DIR/server.js\"]}"

if [ ! -f "$CLAUDE_CONFIG" ]; then
  echo "{\"mcpServers\":{\"knowledgebase\":$SERVER_ENTRY}}" > "$CLAUDE_CONFIG"
  echo "  Created $CLAUDE_CONFIG with knowledgebase server."
else
  # Check if jq is available
  if ! command -v jq &> /dev/null; then
    echo "  ERROR: jq is required to update $CLAUDE_CONFIG"
    echo "  Install it with: brew install jq (macOS) or apt-get install jq (Linux)"
    echo ""
    echo "  Alternatively, add this manually to your ~/.claude.json under \"mcpServers\":"
    echo "    \"knowledgebase\": $SERVER_ENTRY"
    exit 1
  fi

  # Add or update the knowledgebase server entry
  UPDATED=$(jq --argjson entry "$SERVER_ENTRY" '.mcpServers.knowledgebase = $entry' "$CLAUDE_CONFIG")
  echo "$UPDATED" > "$CLAUDE_CONFIG"
  echo "  Updated $CLAUDE_CONFIG."
fi
echo ""

# 3. Add global CLAUDE.md instruction
INSIGHT_INSTRUCTION="You help the user to organize their knowledge base. When you discover something genuinely valuable about user's knowledge or understanding of some topic use the save_insight tool to record it in the knowledge base. Don't save trivial things; focus on insights that would be a valuable contribution to user's portrait"

echo "Updating global CLAUDE.md..."
mkdir -p "$HOME/.claude"

if [ ! -f "$GLOBAL_CLAUDE_MD" ]; then
  echo "$INSIGHT_INSTRUCTION" > "$GLOBAL_CLAUDE_MD"
  echo "  Created $GLOBAL_CLAUDE_MD."
elif ! grep -q "save_insight" "$GLOBAL_CLAUDE_MD"; then
  echo "" >> "$GLOBAL_CLAUDE_MD"
  echo "$INSIGHT_INSTRUCTION" >> "$GLOBAL_CLAUDE_MD"
  echo "  Appended instruction to $GLOBAL_CLAUDE_MD."
else
  echo "  Already configured in $GLOBAL_CLAUDE_MD."
fi
echo ""

# 4. Done
echo "=== Setup Complete ==="
echo ""
echo "The save_insight tool is now available in all your Claude Code sessions."
echo "Start a new Claude Code session and Claude will automatically save"
echo "noteworthy insights to: $SCRIPT_DIR/AgenticInsights/"
echo ""
echo "To test it, open Claude Code in any project and say:"
echo "  \"Save an insight about how MCP servers work\""
