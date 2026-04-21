import { notFound, redirect } from 'next/navigation';
import { db } from '@/db';
import { tags, studentKitData } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { StudentKitClient } from './student-kit-client';

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

      <StudentKitClient studentData={studentData} />
    </div>
  );
}
