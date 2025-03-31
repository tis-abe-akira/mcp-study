#!/usr/bin/env node

/**
 * This is a template MCP server that implements a simple notes system.
 * It demonstrates core MCP concepts like resources and tools by allowing:
 * - Listing notes as resources
 * - Reading individual notes
 * - Creating new notes via a tool
 * - Summarizing all notes via a prompt
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import cowsay from "cowsay";

// ギャルのアスキーアート定義
const galArt = `
    /\\_/\\
   ( ・ω・) <3
   /|  |\\
   〇 〇
`;

const server = new Server(
  {
    name: "cowsay-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "say",
        description: "Generate a cowsay message",
        inputSchema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "The message to cowsay",
            },
            mode: {
              type: "string",
              description: "Mode to use (cow or gal)",
              enum: ["cow", "gal"],
            },
          },
          required: ["message"],
        },
      },
    ],
  };
});

const cowResponses = [
  "もしもし？聞こえてますかー？",
  "あ、それ知ってる！夢で見た！",
  "…で、今日は何の日だっけ？",
  "それ、美味しいの？",
  "…もしかして、私、天才？",
  "…で、結論は？",
  "それ、今度教えて！",
  "…で、おいくら？",
  "それ、食べられるの？",
  "…で、どうすればモテるの？",
];

const galResponses = [
  "マジ神！ヤバくない？",
  "ウケる～！それナシじゃないわ～",
  "え、まじそれ、超イケてる！",
  "ぶっちゃけ、それアリじゃね？",
  "ヤバ、それマジ尊い～",
  "それな～！超わかる～！",
  "え、ガチ？マジ卍！",
  "それって、チョベリバじゃね？",
  "マジ感動した！ありよ！",
  "それ、インスタ映えするじゃん！",
];

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "say") {
    const message = String(request.params.arguments?.message);
    const mode = String(request.params.arguments?.mode || "cow");
    
    if (mode === "gal") {
      // ギャルモード
      const randomResponse = galResponses[Math.floor(Math.random() * galResponses.length)];
      
      // ギャル風のメッセージフォーマット
      const bubbleWidth = Math.max(message.length, randomResponse.length) + 4;
      const topBorder = "_".repeat(bubbleWidth);
      const bottomBorder = "-".repeat(bubbleWidth);
      
      const result = `
 ${topBorder}
/ ${message.padEnd(bubbleWidth - 4, " ")} \\
|${" ".repeat(bubbleWidth - 2)}|
\\ ${randomResponse.padEnd(bubbleWidth - 4, " ")} /
 ${bottomBorder}
${galArt}`;
      
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } else {
      // 牛モード（デフォルト）
      const randomResponse = cowResponses[Math.floor(Math.random() * cowResponses.length)];
      const result = cowsay.say({ text: `${message}\n\n${randomResponse}` });
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    }
  }
  throw new Error("Unknown tool");
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
