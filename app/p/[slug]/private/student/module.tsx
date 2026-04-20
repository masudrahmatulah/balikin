import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Link as LinkIcon, FileText, Plus } from 'lucide-react';
import type { Tag } from '@/db/schema';
import { StudentKitForm } from './student-kit-form';
import { StudentKitDisplay } from './student-kit-display';
import { getStudentKitData } from '@/app/actions/modules';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

interface StudentKitModuleProps {
  tag: Tag;
}

export async function StudentKitModule({ tag }: StudentKitModuleProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || tag.ownerId !== session.user.id) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Anda tidak memiliki akses ke modul ini.</p>
      </div>
    );
  }

  const studentData = await getStudentKitData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Student Kit</h3>
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

