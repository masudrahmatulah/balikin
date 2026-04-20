import { notFound, redirect } from 'next/navigation';
import { db } from '@/db';
import { tags, studentKitData } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Link as LinkIcon, FileText, Plus, Edit, Save } from 'lucide-react';
import { StudentKitForm } from './student-kit-form';
import { StudentKitDisplay } from './student-kit-display';

interface StudentKitPageProps {
  params: Promise<{ slug: string }>;
}

export default async function StudentKitPage({
  params,
}: StudentKitPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/auth?redirectBack=true');
  }

  const { slug } = await params;
  const tag = await db.query.tags.findFirst({
    where: eq(tags.slug, slug),
  });

  if (!tag) {
    notFound();
  }

  // Verify ownership
  if (tag.ownerId !== session.user.id) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Anda tidak memiliki akses ke modul ini.</p>
      </div>
    );
  }

  // Get student kit data
  const studentData = await db.query.studentKitData.findFirst({
    where: eq(studentKitData.userId, session.user.id),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Student Kit
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Kelola jadwal kuliah, deadline tugas, dan dokumen penting Anda
          </p>
        </div>
        {!studentData && (
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-800">
            Belum diisi
          </Badge>
        )}
      </div>

      {studentData ? (
        <>
          <StudentKitDisplay data={studentData} />
          <div className="text-center">
            <StudentKitForm
              initialData={{
                classSchedule: studentData.classSchedule || '',
                assignmentDeadlines: studentData.assignmentDeadlines || '',
                driveLinks: studentData.driveLinks || '',
                ktmKrsPhotos: studentData.ktmKrsPhotos || '',
              }}
              mode="edit"
            />
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Mulai Gunakan Student Kit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum Ada Data
              </h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                Isi data Student Kit Anda untuk mulai melacak jadwal kuliah,
                deadline tugas, dan menyimpan dokumen penting seperti KTM/KRS.
              </p>
              <StudentKitForm initialData={null} mode="create" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
