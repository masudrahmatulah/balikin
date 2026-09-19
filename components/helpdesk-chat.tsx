"use client";

import { useState } from "react";
import { Bot, Loader2, MessageCircle, Send, UserRound } from "lucide-react";
import { HELPDESK_FAQ } from "@/lib/helpdesk-knowledge";

type Message = { role: "user" | "assistant"; content: string };

const CS_WHATSAPP = "6287883956811";

export function HelpdeskChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Halo, saya asisten Balikin. Ceritakan kendala Anda, misalnya lupa password atau nomor WhatsApp yang sudah berganti." },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content || isLoading) return;

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/helpdesk/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const result = await response.json();
      setMessages((current) => [
        ...current,
        { role: "assistant", content: result.answer || result.error || "Silakan hubungi CS Balikin." },
      ]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "Asisten sedang tidak tersedia. Silakan hubungi CS melalui WhatsApp." }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex h-[calc(100dvh-230px)] min-h-[400px] max-h-[680px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:min-h-[460px]">
        <div className="flex items-center gap-3 border-b border-slate-200 p-5 dark:border-slate-700">
          <div className="rounded-xl bg-brand-red p-2 text-white"><Bot className="h-5 w-5" /></div>
          <div><h2 className="font-semibold text-slate-900 dark:text-white">Konsultasi AI Balikin</h2><p className="text-sm text-slate-500 dark:text-slate-400">Jawaban cepat dari panduan resmi Balikin</p></div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-5">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && <Bot className="mt-2 h-4 w-4 shrink-0 text-brand-red" />}
                <p className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === "user" ? "bg-brand-red text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>
                  {message.content}
                </p>
                {message.role === "user" && <UserRound className="mt-2 h-4 w-4 shrink-0 text-slate-400" />}
              </div>
            ))}
            {isLoading && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Sedang mencari jawaban...</div>}
          </div>
          <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
             <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Tulis kendala Anda..." className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-red dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
             <button type="submit" disabled={isLoading || !input.trim()} aria-label="Kirim pesan" className="rounded-xl bg-brand-red px-4 text-white transition-colors hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Pertanyaan Umum</h2>
          <div className="space-y-2">
            {HELPDESK_FAQ.map((item) => <details key={item.question} className="group rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><summary className="cursor-pointer text-sm font-medium text-slate-800 dark:text-slate-100">{item.question}</summary><p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.answer}</p></details>)}
          </div>
        </section>
        <section className="rounded-2xl bg-gradient-to-br from-brand-navy to-brand-red p-5 text-white shadow-lg">
          <MessageCircle className="mb-3 h-7 w-7" />
          <h2 className="font-semibold">Masih belum selesai?</h2>
           <p className="mt-1 text-sm text-red-100">Hubungkan percakapan Anda ke CS/admin untuk verifikasi akun dan bantuan manual.</p>
           <a href={`https://wa.me/${CS_WHATSAPP}?text=${encodeURIComponent("Halo CS Balikin, saya butuh bantuan dari Helpdesk.")}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand-red-dark hover:bg-red-50">Chat CS/Admin</a>
        </section>
      </aside>
    </div>
  );
}
