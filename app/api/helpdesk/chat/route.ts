import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { HELPDESK_SYSTEM_PROMPT } from "@/lib/helpdesk-knowledge";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

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

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Asisten AI sedang belum dikonfigurasi. Silakan lanjutkan melalui WhatsApp CS." },
        { status: 503 },
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
      contents: `${HELPDESK_SYSTEM_PROMPT}\n\nPercakapan:\n${messages}\n\nJawab pertanyaan customer terakhir.`,
      config: {
        temperature: 0.2,
        maxOutputTokens: 500,
      },
    });

    return NextResponse.json({ answer: response.text || "Silakan hubungi CS untuk bantuan lebih lanjut." });
  } catch (error) {
    console.error("[Helpdesk AI] Request failed:", error);
    return NextResponse.json(
      { error: "Asisten AI sedang tidak tersedia. Silakan lanjutkan melalui WhatsApp CS." },
      { status: 502 },
    );
  }
}
