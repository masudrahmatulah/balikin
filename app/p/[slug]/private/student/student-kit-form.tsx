'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Save, Loader2 } from 'lucide-react';
import { updateStudentKit } from '@/app/actions/modules';

interface ClassSchedule {
  course: string;
  room: string;
  day: string;
  time: string;
}

interface Deadline {
  title: string;
  course: string;
  dueDate: string;
}

interface DriveLink {
  name: string;
  url: string;
}

interface StudentKitFormProps {
  initialData: {
    classSchedule: string;
    assignmentDeadlines: string;
    driveLinks: string;
    ktmKrsPhotos: string;
  } | null;
  mode: 'create' | 'edit';
}

export function StudentKitForm({ initialData, mode }: StudentKitFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Parse initial data
  const initialSchedule: ClassSchedule[] = initialData
    ? JSON.parse(initialData.classSchedule || '[]')
    : [];
  const initialDeadlines: Deadline[] = initialData
    ? JSON.parse(initialData.assignmentDeadlines || '[]')
    : [];
  const initialLinks: DriveLink[] = initialData
    ? JSON.parse(initialData.driveLinks || '[]')
    : [];
  const initialPhotos: string[] = initialData
    ? JSON.parse(initialData.ktmKrsPhotos || '[]')
    : [];

  // Form state
  const [schedule, setSchedule] = useState<ClassSchedule[]>(initialSchedule);
  const [deadlines, setDeadlines] = useState<Deadline[]>(initialDeadlines);
  const [links, setLinks] = useState<DriveLink[]>(initialLinks);
  const [photos, setPhotos] = useState<string[]>(initialPhotos);

  // New entry state
  const [newSchedule, setNewSchedule] = useState<ClassSchedule>({
    course: '',
    room: '',
    day: '',
    time: '',
  });
  const [newDeadline, setNewDeadline] = useState<Deadline>({
    title: '',
    course: '',
    dueDate: '',
  });
  const [newLink, setNewLink] = useState<DriveLink>({
    name: '',
    url: '',
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await updateStudentKit({
        classSchedule: JSON.stringify(schedule),
        assignmentDeadlines: JSON.stringify(deadlines),
        driveLinks: JSON.stringify(links),
        ktmKrsPhotos: JSON.stringify(photos),
      });

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} variant={mode === 'create' ? 'default' : 'outline'}>
        {mode === 'create' ? (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Isi Data Student Kit
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Edit Data
          </>
        )}
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Isi Data Student Kit' : 'Edit Data Student Kit'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Class Schedule */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Jadwal Kuliah</Label>
          <div className="space-y-2">
            {schedule.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                <span className="flex-1 font-medium">{item.course}</span>
                <span className="text-gray-600">{item.day}, {item.time}</span>
                <span className="text-gray-500">{item.room}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSchedule(schedule.filter((_, i) => i !== idx))}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Input
              placeholder="Mata kuliah"
              value={newSchedule.course}
              onChange={(e) => setNewSchedule({ ...newSchedule, course: e.target.value })}
            />
            <Input
              placeholder="Hari"
              value={newSchedule.day}
              onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value })}
            />
            <Input
              placeholder="Waktu"
              value={newSchedule.time}
              onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
            />
            <Input
              placeholder="Ruang"
              value={newSchedule.room}
              onChange={(e) => setNewSchedule({ ...newSchedule, room: e.target.value })}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (newSchedule.course && newSchedule.day && newSchedule.time) {
                setSchedule([...schedule, newSchedule]);
                setNewSchedule({ course: '', room: '', day: '', time: '' });
              }
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Jadwal
          </Button>
        </div>

        {/* Deadlines */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Deadline Tugas</Label>
          <div className="space-y-2">
            {deadlines.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                <span className="flex-1 font-medium">{item.title}</span>
                <span className="text-gray-600">{item.course}</span>
                <span className="text-gray-500">
                  {new Date(item.dueDate).toLocaleDateString('id-ID')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeadlines(deadlines.filter((_, i) => i !== idx))}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Input
              placeholder="Nama tugas"
              value={newDeadline.title}
              onChange={(e) => setNewDeadline({ ...newDeadline, title: e.target.value })}
            />
            <Input
              placeholder="Mata kuliah"
              value={newDeadline.course}
              onChange={(e) => setNewDeadline({ ...newDeadline, course: e.target.value })}
            />
            <Input
              type="date"
              value={newDeadline.dueDate}
              onChange={(e) => setNewDeadline({ ...newDeadline, dueDate: e.target.value })}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (newDeadline.title && newDeadline.dueDate) {
                setDeadlines([...deadlines, newDeadline]);
                setNewDeadline({ title: '', course: '', dueDate: '' });
              }
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Deadline
          </Button>
        </div>

        {/* Drive Links */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Link Drive Kelompok</Label>
          <div className="space-y-2">
            {links.map((link, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                <span className="flex-1 font-medium truncate">{link.name}</span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate"
                >
                  {link.url}
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLinks(links.filter((_, i) => i !== idx))}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Nama link"
              value={newLink.name}
              onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
            />
            <Input
              placeholder="URL"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (newLink.name && newLink.url) {
                setLinks([...links, newLink]);
                setNewLink({ name: '', url: '' });
              }
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Link
          </Button>
        </div>

        {/* Photo URLs (placeholder for now) */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">URL Foto KTM/KRS</Label>
          <p className="text-sm text-gray-600">
            Masukkan URL foto KTM dan KRS Anda (satu URL per baris)
          </p>
          <Textarea
            placeholder="https://example.com/ktm.jpg&#10;https://example.com/krs.jpg"
            value={photos.join('\n')}
            onChange={(e) =>
              setPhotos(e.target.value.split('\n').filter((url) => url.trim() !== ''))
            }
            rows={4}
          />
        </div>

        {/* Actions */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Simpan
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
