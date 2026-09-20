'use client';

import { useState } from 'react';
import { answerHelpdeskQuestion, ignoreHelpdeskQuestion } from '@/app/actions/admin-helpdesk-actions';

type Question = {
  id: string;
  question: string;
  answer: string | null;
  status: string;
  createdAt: Date | null;
};

export function HelpdeskQuestionsReview({ questions }: { questions: Question[] }) {
  const [items, setItems] = useState(questions);
  const [activeTab, setActiveTab] = useState<'unreviewed' | 'published' | 'ignored'>('unreviewed');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const visibleItems = items.filter((item) => item.status === activeTab);
  const counts = {
    unreviewed: items.filter((item) => item.status === 'unreviewed').length,
    published: items.filter((item) => item.status === 'published').length,
    ignored: items.filter((item) => item.status === 'ignored').length,
  };

  async function publish(id: string) {
    setSaving(id);
    setError(null);
    const result = await answerHelpdeskQuestion(id, answers[id] || '');
    setSaving(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    setItems((current) => current.map((item) => item.id === id ? { ...item, answer: answers[id], status: 'published' } : item));
  }

  async function ignore(id: string) {
    setSaving(id);
    setError(null);
    const result = await ignoreHelpdeskQuestion(id);
    setSaving(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    setItems((current) => current.map((item) => item.id === id ? { ...item, status: 'ignored' } : item));
  }

  return (
    <div className="space-y-4">
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</p>}
      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
        {(['unreviewed', 'published', 'ignored'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
          >
            {tab === 'unreviewed' ? 'Belum Direview' : tab === 'published' ? 'Published' : 'Ignored'} ({counts[tab]})
          </button>
        ))}
      </div>
      {visibleItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">Belum ada pertanyaan yang perlu ditinjau.</div>
      ) : visibleItems.map((item) => (
        <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : item.status === 'ignored' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>{item.status === 'published' ? 'Published' : item.status === 'ignored' ? 'Ignored' : 'Unreviewed'}</span>
            <time className="text-xs text-slate-500 dark:text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID') : '-'}</time>
          </div>
          <p className="mt-3 font-medium text-slate-900 dark:text-white">{item.question}</p>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Periksa & hapus data pribadi (no WA/email/OTP) dari jawaban sebelum publish — jawaban jadi acuan AI untuk semua user.</p>
          <textarea
            value={answers[item.id] ?? item.answer ?? ''}
            onChange={(event) => setAnswers((current) => ({ ...current, [item.id]: event.target.value }))}
            placeholder="Tulis jawaban resmi untuk menjadi acuan AI..."
            className="mt-4 min-h-28 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {item.status !== 'ignored' && (
              <button type="button" onClick={() => publish(item.id)} disabled={saving === item.id} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                {saving === item.id ? 'Menyimpan...' : item.status === 'published' ? 'Perbarui Knowledge Base' : 'Jawab & Publish ke AI'}
              </button>
            )}
            {item.status === 'unreviewed' && (
              <button type="button" onClick={() => ignore(item.id)} disabled={saving === item.id} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
                Ignore
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
