'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Download, User as UserIcon } from 'lucide-react';
import { StudentKitForm } from './student-kit-form';
import { StudentKitDisplay } from './student-kit-display';
import { InternshipVCardDisplay } from './internship-vcard-display';
import { InternshipVCardForm } from './internship-vcard-form';
import { NotificationSettings } from './notification-settings';
import { ScheduleShareModal } from './schedule-share-modal';
import { ImportScheduleModal } from './import-schedule-modal';
import type { StudentKitData } from '@/db/schema';

interface StudentKitClientProps {
  studentData: StudentKitData | null;
}

export function StudentKitClient({ studentData }: StudentKitClientProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [shareData, setShareData] = useState<{
    shareCode: string;
    shareUrl: string;
    expiresAt: string;
  } | null>(null);

  // Parse vCard data
  const vcardData = studentData?.vcardData
    ? JSON.parse(studentData.vcardData)
    : null;

  const handleShare = async () => {
    try {
      const response = await fetch('/api/student-kit/schedule/share', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Gagal membuat kode berbagi');
      }

      const data = await response.json();
      setShareData(data);
      setShareModalOpen(true);
    } catch (error) {
      console.error('Share error:', error);
      alert(error instanceof Error ? error.message : 'Gagal membagikan jadwal');
    }
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="flex gap-2 justify-end mb-4">
        <Button
          variant="outline"
          onClick={() => setImportModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Import Jadwal
        </Button>
        {studentData && (
          <Button
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Bagikan Jadwal
          </Button>
        )}
      </div>

      {/* Content */}
      {studentData ? (
        <>
          <StudentKitDisplay data={studentData} />

          {/* Notification Settings Section */}
          <div className="mt-6">
            <NotificationSettings
              initialEnabled={studentData.whatsappNotificationsEnabled || false}
              initialPhoneNumber={studentData.notificationPhoneNumber}
            />
          </div>

          {/* Internship vCard Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-purple-600" />
                Internship vCard
              </h3>
              {!vcardData && (
                <span className="text-xs text-gray-500">Belum dibuat</span>
              )}
            </div>

            {vcardData ? (
              <InternshipVCardDisplay data={studentData} />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Buat vCard profesional untuk networking dan keperluan magang
                    </p>
                    <InternshipVCardForm initialData={null} mode="create" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Edit Forms */}
          <div className="text-center mt-6">
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
                <UserIcon className="w-10 h-10 text-blue-600" />
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

      {/* Modals */}
      {shareData && (
        <ScheduleShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          shareCode={shareData.shareCode}
          shareUrl={shareData.shareUrl}
          expiresAt={shareData.expiresAt}
        />
      )}

      <ImportScheduleModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
      />
    </>
  );
}
