import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

const KNOWLEDGE_DIR = path.join(process.cwd(), "content", "helpdesk");

function tokenize(value: string) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2),
  );
}

export async function retrieveHelpdeskKnowledge(query: string, limit = 3) {
  const queryTokens = tokenize(query);
  const files = await fs.readdir(KNOWLEDGE_DIR);
  const documents = await Promise.all(
    files
      .filter((file) => file.endsWith(".md"))
      .map(async (file) => ({
        file,
        content: await fs.readFile(path.join(KNOWLEDGE_DIR, file), "utf8"),
      })),
  );

  return documents
    .map((document) => {
      const documentTokens = tokenize(document.content);
      const score = [...queryTokens].reduce(
        (total, token) => total + (documentTokens.has(token) ? 1 : 0),
        0,
      );
      return { ...document, score };
    })
    .filter((document) => document.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
