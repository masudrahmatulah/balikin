'use server';

import { and, desc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { helpdeskQuestions, user } from '@/db/schema';
import { auth } from '@/lib/auth';

async function getAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const admin = await db.query.user.findFirst({
    where: and(eq(user.id, session.user.id), eq(user.role, 'admin'), eq(user.app_id, 'balikin_id')),
    columns: { id: true },
  });
  return admin;
}

export async function getHelpdeskQuestions() {
  const admin = await getAdmin();
  if (!admin) return { error: 'Unauthorized' as const };

  return {
    questions: await db.query.helpdeskQuestions.findMany({
      where: eq(helpdeskQuestions.app_id, 'balikin_id'),
      orderBy: [desc(helpdeskQuestions.createdAt)],
      limit: 100,
    }),
  };
}

export async function answerHelpdeskQuestion(questionId: string, answer: string) {
  const admin = await getAdmin();
  if (!admin) return { error: 'Unauthorized' };
  const cleanAnswer = answer.trim();
  if (!cleanAnswer) return { error: 'Jawaban tidak boleh kosong' };

  await db.update(helpdeskQuestions)
    .set({ answer: cleanAnswer, status: 'published', reviewedBy: admin.id, reviewedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(helpdeskQuestions.id, questionId), eq(helpdeskQuestions.app_id, 'balikin_id')));

  revalidatePath('/admin/helpdesk/questions');
  return { success: true };
}

export async function ignoreHelpdeskQuestion(questionId: string) {
  const admin = await getAdmin();
  if (!admin) return { error: 'Unauthorized' };

  await db.update(helpdeskQuestions)
    .set({ status: 'ignored', reviewedBy: admin.id, reviewedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(helpdeskQuestions.id, questionId), eq(helpdeskQuestions.app_id, 'balikin_id')));

  revalidatePath('/admin/helpdesk/questions');
  return { success: true };
}
