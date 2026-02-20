## My humble dev Knowledge Base

In ClaudeCourses, claude code is used as an interactive educator.

AgenticInsights are automatically captured from my Claude Code sessions using an MCP server.

### Setup Your Own

1. Clone this repo (or fork it and clear the content):
   ```bash
   git clone <your-repo-url> ~/MyKnowledgeBase
   cd ~/MyKnowledgeBase
   ```

2. Run the setup script:
   ```bash
   ./setup.sh
   ```

   This will:
   - Install the MCP server dependencies
   - Register the `save_insight` tool globally in Claude Code
   - Add a global instruction so Claude proactively saves insights

3. Run the cleaning script:
   ```bash
   ./wipe-data.sh
   ```

   This will:
   - Clear the repo of my data

4. Start a new Claude Code session in any project. Claude now has a `save_insight` tool and will use it when it discovers something worth remembering.
