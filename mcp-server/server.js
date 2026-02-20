import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");

const server = new McpServer({
  name: "knowledgebase",
  version: "1.0.0",
});

server.tool(
  "save_insight",
  "You help the user to organize their knowledge base. " + 
    "Save an insight from the current coding session to user's personal knowledge base. " +
    "Use this when you discover something genuinely valuable about user's knowledge or understanding of some topic.",
  {
    topic: z
      .string()
      .describe(
        "The broad topic/category for this insight (e.g. 'typescript', 'debugging', 'architecture', 'git')"
      ),
    content: z
      .string()
      .describe(
        "The insight content. Be specific and include code examples if relevant."
      ),
    source_project: z
      .string()
      .optional()
      .describe("The project this insight came from"),
    tags: z
      .array(z.string())
      .optional()
      .describe("Optional tags for categorization"),
  },
  async ({ topic, content, source_project, tags }) => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const promptTemplate = await readFile(
        resolve(__dirname, "prompt.txt"),
        "utf-8"
      );

      const prompt = promptTemplate
        .replaceAll("{{topic}}", topic)
        .replaceAll("{{content}}", content)
        .replaceAll("{{source_project}}", source_project || "general")
        .replaceAll("{{tags}}", tags?.join(", ") || "none")
        .replaceAll("{{date}}", today);

      const result = await runClaude(prompt);

      return {
        content: [
          {
            type: "text",
            text: `Insight saved to knowledge base.\n\nTopic: ${topic}\nDate: ${today}\n\n${result}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to save insight: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

function runClaude(prompt) {
  return new Promise((resolve, reject) => {
    const child = execFile(
      "claude",
      ["-p", "--output-format", "text", prompt],
      {
        cwd: REPO_ROOT,
        timeout: 120_000,
        maxBuffer: 1024 * 1024,
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`claude exited with error: ${error.message}\n${stderr}`));
        } else {
          resolve(stdout.trim());
        }
      }
    );
  });
}

const transport = new StdioServerTransport();
await server.connect(transport);
