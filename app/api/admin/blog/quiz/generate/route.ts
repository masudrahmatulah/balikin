import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { checkBlogGenerateRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";

const QUIZ_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      minItems: 5,
      maxItems: 5,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 4, maxItems: 4 },
          correctAnswerIndex: { type: Type.INTEGER },
        },
        required: ["question", "options", "correctAnswerIndex"],
      },
    },
  },
  required: ["questions"],
} as const;

function getGeminiApiKeys() {
  const numberedKeys = [1, 2, 3]
    .map((number) => process.env[`GEMINI_API_KEY_${number}`])
    .filter((key): key is string => Boolean(key?.trim()));
  return numberedKeys.length > 0 ? numberedKeys : process.env.GEMINI_API_KEY ? [process.env.GEMINI_API_KEY] : [];
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
    if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await auth.api.getSession({ headers: await headers() });
    const limit = await checkBlogGenerateRateLimit(`blogquiz:${session?.user?.id ?? "unknown"}`);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Batas generate AI tercapai. Coba lagi nanti." },
        { status: 429, headers: getRateLimitHeaders(limit) },
      );
    }

    const body = await request.json() as { title?: unknown; focusKeyword?: unknown; content?: unknown };
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 200) : "";
    const focusKeyword = typeof body.focusKeyword === "string" ? body.focusKeyword.trim().slice(0, 120) : "";
    const content = typeof body.content === "string" ? body.content.trim().slice(0, 20_000) : "";
    if (title.length < 5 || content.length < 150) {
      return NextResponse.json({ error: "Isi judul dan konten artikel minimal 150 karakter sebelum membuat kuis." }, { status: 400 });
    }

    const apiKeys = getGeminiApiKeys();
    if (apiKeys.length === 0) return NextResponse.json({ error: "Gemini API belum dikonfigurasi." }, { status: 503 });

    const prompt = `
Anda adalah editor kuis edukatif berbahasa Indonesia. Buat tepat 5 soal pilihan ganda yang menguji pemahaman pembaca terhadap artikel berikut.

JUDUL ARTIKEL: ${title}
FOCUS KEYWORD: ${focusKeyword || "tidak ditentukan"}
ISI ARTIKEL:
${content}

ATURAN:
- Gunakan hanya fakta dan penjelasan yang secara eksplisit tersedia dalam isi artikel. Jangan menambah pengetahuan eksternal, hadiah, syarat promosi, atau klaim Balikin.
- Buat tepat 5 pertanyaan yang jelas, tidak ambigu, dan bervariasi; campurkan pemahaman dasar dengan penerapan sederhana.
- Setiap soal wajib memiliki tepat 4 opsi berbeda dan hanya satu jawaban benar.
- correctAnswerIndex adalah indeks opsi yang benar, dimulai dari 0.
- Opsi salah harus masuk akal tetapi jelas dapat dibantah berdasarkan isi artikel.
- Hindari pertanyaan jebakan, opini, fakta yang tidak dijelaskan, dan pengulangan pertanyaan.
- Kembalikan JSON saja sesuai schema, tanpa rewardText atau minScoreToWin. Hadiah dan nilai kelulusan ditentukan admin.
`.trim();

    let lastError: unknown;
    for (const model of getGeminiModels()) {
      for (let index = 0; index < apiKeys.length; index += 1) {
        try {
          const response = await new GoogleGenAI({ apiKey: apiKeys[index] }).models.generateContent({
            model,
            contents: prompt,
            config: { temperature: 0.5, maxOutputTokens: 2200, responseMimeType: "application/json", responseSchema: QUIZ_RESPONSE_SCHEMA },
          });
          const parsed = JSON.parse(response.text?.trim() || "{}") as { questions?: unknown };
          if (!Array.isArray(parsed.questions) || parsed.questions.length !== 5) throw new Error("AI returned an invalid quiz question count");

          const questions = parsed.questions.map((value) => {
            if (!value || typeof value !== "object") throw new Error("AI returned an invalid question");
            const question = value as Record<string, unknown>;
            if (typeof question.question !== "string" || !question.question.trim() || !Array.isArray(question.options) || question.options.length !== 4) {
              throw new Error("AI returned an incomplete question");
            }
            const options = question.options.map((option) => typeof option === "string" ? option.trim() : "");
            if (options.some((option) => !option) || new Set(options.map((option) => option.toLocaleLowerCase("id-ID"))).size !== 4) {
              throw new Error("AI returned invalid or duplicate answer options");
            }
            if (typeof question.correctAnswerIndex !== "number" || !Number.isInteger(question.correctAnswerIndex) || question.correctAnswerIndex < 0 || question.correctAnswerIndex > 3) {
              throw new Error("AI returned an invalid answer key");
            }
            return { question: question.question.trim(), options, correctAnswerIndex: question.correctAnswerIndex };
          });

          return NextResponse.json({ questions });
        } catch (error) {
          lastError = error;
          console.warn(`[Blog Quiz AI] Model ${model}, key ${index + 1} failed; trying fallback.`);
        }
      }
    }

    console.error("[Blog Quiz AI] All attempts failed:", lastError);
    return NextResponse.json({ error: "Kuis AI gagal dibuat. Silakan coba lagi." }, { status: 502 });
  } catch (error) {
    console.error("[Blog Quiz AI] Request failed:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat membuat kuis." }, { status: 500 });
  }
}
