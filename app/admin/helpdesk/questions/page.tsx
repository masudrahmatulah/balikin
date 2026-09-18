import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { getHelpdeskQuestions } from '@/app/actions/admin-helpdesk-actions';
import { HelpdeskQuestionsReview } from '@/components/admin/helpdesk-questions-review';

export const dynamic = 'force-dynamic';

export default async function AdminHelpdeskQuestionsPage() {
  const session = await getAdminSession();
  if (!session) redirect('/sign-in?redirect=/admin/helpdesk/questions');

  const result = await getHelpdeskQuestions();
  if ('error' in result) redirect('/sign-in?redirect=/admin/helpdesk/questions');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Helpdesk Questions</h1>
        <p className="mt-2 text-gray-600 dark:text-slate-400">Tinjau pertanyaan yang belum terjawab dan terbitkan jawaban resmi ke knowledge base AI.</p>
      </header>
      <HelpdeskQuestionsReview questions={result.questions} />
    </div>
  );
}
