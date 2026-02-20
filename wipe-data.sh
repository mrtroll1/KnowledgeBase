#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== KnowledgeBase Data Wipe ==="
echo ""
echo "This will delete all content except:"
echo "  - mcp-server/"
echo "  - claude-courses/"
echo "  - agentic-insights/ (emptied)"
echo "  - setup.sh"
echo "  - wipe-data.sh"
echo "  - CLAUDE.md"
echo "  - README.md"
echo "  - .gitignore"
echo ""
read -p "Are you sure? (y/N) " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

cd "$SCRIPT_DIR"

# Remove everything except the keep list
for item in *; do
  case "$item" in
    mcp-server|agentic-insights|claude-courses|setup.sh|wipe-data.sh|CLAUDE.md|README.md)
      ;;
    *)
      echo "Removing $item"
      rm -rf "$item"
      ;;
  esac
done

# Also handle hidden files (except .git, .gitignore, .claude)
for item in .*; do
  case "$item" in
    .|..|.git|.gitignore|.claude)
      ;;
    *)
      echo "Removing $item"
      rm -rf "$item"
      ;;
  esac
done

# Clear agentic-insights contents but keep the directory
if [ -d "agentic-insights" ]; then
  echo "Clearing agentic-insights/"
  rm -rf agentic-insights/*
fi
mkdir -p agentic-insights

echo ""
echo "Done. Your knowledge base is clean and ready for fresh content."
