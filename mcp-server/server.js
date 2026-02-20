import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { spawn } from "node:child_process";
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
    "Use this when you discover something genuinely valuable about user's knowledge or understanding of some topic. " +
    "Insights are split into strengths and weaknesses — you can provide either or both.",
  {
    topic: z
      .string()
      .describe(
        "The broad topic/category for this insight (e.g. 'typescript', 'debugging', 'architecture', 'git')"
      ),
    strengths: z
      .string()
      .optional()
      .describe(
        "What the user does well in this topic. Be specific and include examples if relevant."
      ),
    weaknesses: z
      .string()
      .optional()
      .describe(
        "What the user could improve in this topic. Be specific and include examples if relevant."
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
  async ({ topic, strengths, weaknesses, source_project, tags }) => {
    if (!strengths && !weaknesses) {
      return {
        content: [
          {
            type: "text",
            text: "At least one of 'strengths' or 'weaknesses' must be provided.",
          },
        ],
        isError: true,
      };
    }

    try {
      const promptTemplate = await readFile(
        resolve(__dirname, "prompt.txt"),
        "utf-8"
      );

      const prompt = promptTemplate
        .replaceAll("{{topic}}", topic)
        .replaceAll("{{strengths}}", strengths || "N/A")
        .replaceAll("{{weaknesses}}", weaknesses || "N/A")
        .replaceAll("{{source_project}}", source_project || "general")
        .replaceAll("{{tags}}", tags?.join(", ") || "none");

      const result = await runClaude(prompt);

      return {
        content: [
          {
            type: "text",
            text: `Insight saved to knowledge base.\n\nTopic: ${topic}\n\n${result}`,
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
    const child = spawn("claude", ["-p", "--output-format", "text"], {
      cwd: REPO_ROOT,
      timeout: 120_000,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => { stdout += data; });
    child.stderr.on("data", (data) => { stderr += data; });

    child.on("error", (error) => {
      reject(new Error(`Failed to start claude: ${error.message}`));
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`claude exited with code ${code}\n${stderr}`));
      } else {
        resolve(stdout.trim());
      }
    });

    child.stdin.write(prompt);
    child.stdin.end();
  });
}

const transport = new StdioServerTransport();
await server.connect(transport);
