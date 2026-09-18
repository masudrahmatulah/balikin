import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { HELPDESK_SYSTEM_PROMPT } from "@/lib/helpdesk-knowledge";
import { retrieveHelpdeskKnowledge } from "@/lib/helpdesk-retrieval";
import { db } from "@/db";
import { helpdeskQuestions } from "@/db/schema";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

function getGeminiApiKeys() {
  const numberedKeys = [1, 2, 3]
    .map((number) => process.env[`GEMINI_API_KEY_${number}`])
    .filter((key): key is string => Boolean(key?.trim()));

  if (numberedKeys.length > 0) return numberedKeys;
  return process.env.GEMINI_API_KEY ? [process.env.GEMINI_API_KEY] : [];
}

function getGeminiModels() {
  return [...new Set([
    process.env.GEMINI_MODEL || "gemini-flash-lite-latest",
    process.env.GEMINI_FALLBACK_MODEL || "gemini-3.1-flash-lite",
    "gemini-flash-lite-latest",
  ])];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { messages?: ChatMessage[] };
    const messages = (body.messages ?? [])
      .filter((message) => (message.role === "user" || message.role === "assistant") && typeof message.content === "string")
      .slice(-8)
      .map((message) => `${message.role === "user" ? "Customer" : "Assistant"}: ${message.content.slice(0, 1200)}`)
      .join("\n");

    if (!messages) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
    }

    const latestQuestion = [...(body.messages ?? [])]
      .reverse()
      .find((message) => message.role === "user")?.content || messages;
    const relevantDocuments = await retrieveHelpdeskKnowledge(latestQuestion);
    if (relevantDocuments.length === 0) {
      await db.insert(helpdeskQuestions).values({
        app_id: "balikin_id",
        question: latestQuestion.slice(0, 2000),
        status: "unreviewed",
      });
    }
    const documentContext = relevantDocuments.length > 0
      ? relevantDocuments.map((document) => `Dokumen: ${document.file}\n${document.content}`).join("\n\n")
      : "Tidak ada dokumen yang cukup relevan. Jangan mengarang jawaban; arahkan ke CS/admin.";

    const apiKeys = getGeminiApiKeys();
    if (apiKeys.length === 0) {
      return NextResponse.json(
        { error: "Asisten AI sedang belum dikonfigurasi. Silakan lanjutkan melalui WhatsApp CS." },
        { status: 503 },
      );
    }

    let lastError: unknown;
    for (const model of getGeminiModels()) {
      for (let index = 0; index < apiKeys.length; index += 1) {
        try {
          const ai = new GoogleGenAI({ apiKey: apiKeys[index] });
          const response = await ai.models.generateContent({
            model,
            contents: `${HELPDESK_SYSTEM_PROMPT}\n\nDokumen relevan:\n${documentContext}\n\nPercakapan:\n${messages}\n\nJawab pertanyaan customer terakhir berdasarkan dokumen relevan.`,
            config: {
              temperature: 0.2,
              maxOutputTokens: 500,
            },
          });

          return NextResponse.json({ answer: response.text || "Silakan hubungi CS untuk bantuan lebih lanjut." });
        } catch (error) {
          lastError = error;
          const status = typeof error === "object" && error !== null && "status" in error
            ? (error as { status?: number }).status
            : undefined;
          console.warn(`[Helpdesk AI] Model ${model}, key ${index + 1} failed${status ? ` (${status})` : ""}; trying fallback.`);
        }
      }
    }

    throw lastError || new Error("All Gemini API keys failed");
  } catch (error) {
    console.error("[Helpdesk AI] Request failed:", error);
    return NextResponse.json(
      { error: "Asisten AI sedang tidak tersedia. Silakan lanjutkan melalui WhatsApp CS." },
      { status: 502 },
    );
  }
}
