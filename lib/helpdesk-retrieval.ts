import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { helpdeskQuestions } from "@/db/schema";

const KNOWLEDGE_DIR = path.join(process.cwd(), "content", "helpdesk");

function tokenize(value: string) {
  const stopWords = new Set(["dan", "yang", "untuk", "dengan", "atau", "dari", "pada", "saya", "anda", "fitur", "barang", "akun", "sistem", "balikin"]);
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2 && !stopWords.has(token)),
  );
}

export async function retrieveHelpdeskKnowledge(query: string, limit = 3) {
  const queryTokens = tokenize(query);
  const files = await fs.readdir(KNOWLEDGE_DIR);
  const fileDocuments = await Promise.all(
    files
      .filter((file) => file.endsWith(".md"))
      .map(async (file) => ({
        file,
        content: await fs.readFile(path.join(KNOWLEDGE_DIR, file), "utf8"),
      })),
  );
  const publishedQuestions = await db.query.helpdeskQuestions.findMany({
    where: eq(helpdeskQuestions.status, "published"),
    columns: { id: true, question: true, answer: true },
    limit: 100,
  });
  const databaseDocuments = publishedQuestions
    .filter((item) => item.answer)
    .map((item) => ({
      file: `admin-answer-${item.id}.md`,
      content: `Question: ${item.question}\nAnswer: ${item.answer}`,
    }));
  const documents = [...fileDocuments, ...databaseDocuments];

  return documents
    .map((document) => {
      const documentTokens = tokenize(document.content);
      const score = [...queryTokens].reduce(
        (total, token) => total + (documentTokens.has(token) ? 1 : 0),
        0,
      );
      return { ...document, score };
    })
    // Require at least two matching terms to avoid treating generic words as proof of relevance.
    .filter((document) => document.score > 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
