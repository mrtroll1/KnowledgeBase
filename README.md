## My humble dev Knowledge Base

**hand-picked** are some books or checklists that I studied. <br>
**claude-courses** is me using Claude Code as an interactive educator. <br>
**agentic-insights** are automatically captured from my Claude Code sessions using an MCP server.

### Setup Your Own

1. Clone or fork this repo:
   ```bash
   git clone https://github.com/mrtroll1/KnowledgeBase ~/MyKnowledgeBase
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
