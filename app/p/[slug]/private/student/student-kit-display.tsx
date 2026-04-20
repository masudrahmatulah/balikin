'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Link as LinkIcon, FileText } from 'lucide-react';
import type { StudentKitData } from '@/db/schema';

interface StudentKitDisplayProps {
  data: StudentKitData;
}

export function StudentKitDisplay({ data }: StudentKitDisplayProps) {
  const classSchedule = JSON.parse(data.classSchedule || '[]');
  const deadlines = JSON.parse(data.assignmentDeadlines || '[]');
  const links = JSON.parse(data.driveLinks || '[]');
  const photos = JSON.parse(data.ktmKrsPhotos || '[]');

  return (
    <div className="space-y-6">
      {/* Class Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Jadwal Kuliah
          </CardTitle>
        </CardHeader>
        <CardContent>
          {classSchedule.length > 0 ? (
            <div className="space-y-3">
              {classSchedule.map((cls: any, idx: number) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{cls.course}</p>
                    <p className="text-sm text-gray-600">{cls.room}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{cls.day}</Badge>
                    <Badge variant="secondary">{cls.time}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Belum ada jadwal kuliah
            </p>
          )}
        </CardContent>
      </Card>

      {/* Assignment Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Deadline Tugas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deadlines.length > 0 ? (
            <div className="space-y-3">
              {deadlines
                .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .map((task: any, idx: number) => {
                  const dueDate = new Date(task.dueDate);
                  const isUrgent = dueDate.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000; // Less than 3 days
                  const isOverdue = dueDate.getTime() < Date.now();

                  return (
                    <div
                      key={idx}
                      className={`border rounded-lg p-3 ${
                        isOverdue
                          ? 'bg-red-50 border-red-200'
                          : isUrgent
                          ? 'bg-orange-50 border-orange-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{task.course}</p>
                        </div>
                        <Badge
                          variant={isOverdue ? 'destructive' : isUrgent ? 'default' : 'outline'}
                        >
                          {dueDate.toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Belum ada deadline tugas
            </p>
          )}
        </CardContent>
      </Card>

      {/* Drive Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-green-600" />
            Link Drive Kelompok
          </CardTitle>
        </CardHeader>
        <CardContent>
          {links.length > 0 ? (
            <div className="space-y-2">
              {links.map((link: any, idx: number) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full justify-start">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    <span className="flex-1 text-left">{link.name}</span>
                    <span className="text-xs text-gray-500">→</span>
                  </Button>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Belum ada link drive
            </p>
          )}
        </CardContent>
      </Card>

      {/* KTM/KRS Photos */}
      {photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Foto KTM & KRS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {photos.map((photo: string, idx: number) => (
                <div key={idx} className="relative group">
                  <img
                    src={photo}
                    alt={`Document ${idx + 1}`}
                    className="w-full h-auto rounded-lg border border-gray-200"
                  />
                  <a
                    href={photo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center"
                  >
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                      Buka
                    </span>
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
