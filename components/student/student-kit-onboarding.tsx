'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  BookOpen,
  Calendar,
  Clock,
  Upload,
  User,
  Bell,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  SkipForward,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Selamat Datang di Student Kit!',
    icon: BookOpen,
  },
  {
    id: 'schedule',
    title: 'Tambah Jadwal Kuliah',
    icon: Calendar,
  },
  {
    id: 'deadlines',
    title: 'Set Deadline Tugas',
    icon: Clock,
  },
  {
    id: 'documents',
    title: 'Upload KTM/KRS',
    icon: Upload,
  },
  {
    id: 'profile',
    title: 'Buat Profil',
    icon: User,
  },
  {
    id: 'notifications',
    title: 'Aktifkan Notifikasi',
    icon: Bell,
  },
  {
    id: 'complete',
    title: 'Selesai!',
    icon: CheckCircle,
  },
];

interface OnboardingData {
  classSchedule?: any[];
  deadlines?: any[];
  ktmKrsPhotos?: string[];
  vcardData?: any;
  notificationsEnabled?: boolean;
}

export function StudentKitOnboarding({ tagSlug }: { tagSlug: string }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({});
  const [isLoading, setIsLoading] = useState(false);

  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = async () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      // Call API to mark onboarding as complete
      await fetch(`/api/tags/${tagSlug}/onboarding/complete`, {
        method: 'POST',
      });
      router.push(`/p/${tagSlug}/private/student`);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StepIcon = step.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Langkah {currentStep + 1} dari {ONBOARDING_STEPS.length}
            </span>
            <span className="text-sm text-slate-500">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="border-2 shadow-xl">
          <CardContent className="p-8">
            {/* Step Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500 text-white">
                <StepIcon className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {getStepDescription(step.id)}
                </p>
              </div>
            </div>

            {/* Step Form Content */}
            <div className="min-h-[300px]">
              {currentStep === 0 && <WelcomeStep />}
              {currentStep === 1 && <ScheduleStep data={data} setData={setData} />}
              {currentStep === 2 && <DeadlinesStep data={data} setData={setData} />}
              {currentStep === 3 && <DocumentsStep data={data} setData={setData} />}
              {currentStep === 4 && <ProfileStep data={data} setData={setData} />}
              {currentStep === 5 && <NotificationsStep data={data} setData={setData} />}
              {currentStep === 6 && <CompleteStep />}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>

              <div className="flex gap-2">
                {currentStep < ONBOARDING_STEPS.length - 2 && (
                  <Button variant="ghost" onClick={handleSkip}>
                    <SkipForward className="h-4 w-4 mr-1" />
                    Skip Tutorial
                  </Button>
                )}
                <Button onClick={handleNext} disabled={isLoading}>
                  {currentStep === ONBOARDING_STEPS.length - 1 ? 'Selesai' : 'Lanjut'}
                  {currentStep < ONBOARDING_STEPS.length - 1 && (
                    <ChevronRight className="h-4 w-4 ml-1" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {ONBOARDING_STEPS.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(index)}
              className={cn(
                'w-3 h-3 rounded-full transition-all',
                index === currentStep
                  ? 'bg-blue-500 w-8'
                  : index < currentStep
                  ? 'bg-blue-300'
                  : 'bg-slate-300'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function getStepDescription(stepId: string): string {
  const descriptions: Record<string, string> = {
    welcome: 'Student Kit membantu Anda mengelola kehidupan kampus dalam satu tempat.',
    schedule: 'Tambahkan jadwal kuliah Anda agar tidak ada yang terlewat.',
    deadlines: 'Catat deadline tugas dan ujian untuk pengingat yang tepat waktu.',
    documents: 'Simpan KTM dan KRS sebagai backup digital.',
    profile: 'Buat profil untuk networking dengan teman kampus.',
    notifications: 'Dapatkan notifikasi WhatsApp sebelum deadline tiba.',
    complete: 'Student Kit siap digunakan! Mulai kelola kampus Anda.',
  };
  return descriptions[stepId] || '';
}

// Step Components

function WelcomeStep() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FeatureCard
          icon={Calendar}
          title="Jadwal Kuliah"
          description="Satu tempat untuk semua jadwal Anda"
        />
        <FeatureCard
          icon={Clock}
          title="Deadline Tugas"
          description="Notifikasi pengingat otomatis"
        />
        <FeatureCard
          icon={Upload}
          title="KTM/KRS Digital"
          description="Backup aman untuk dokumen penting"
        />
        <FeatureCard
          icon={User}
          title="Profil Networking"
          description="Bagikan info kontak dengan teman"
        />
      </div>
    </div>
  );
}

function ScheduleStep({ data, setData }: { data: OnboardingData; setData: (d: OnboardingData) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Mulai dengan menambahkan 1-2 jadwal kuliah Anda. Anda bisa menambahkan lebih banyak nanti.
      </p>
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 text-center">
        <Calendar className="h-8 w-8 mx-auto mb-2 text-slate-400" />
        <p className="text-sm text-slate-500">Form jadwal akan ditampilkan di sini</p>
      </div>
      <p className="text-xs text-slate-500 text-center">Atau lewati langkah ini dan tambah nanti</p>
    </div>
  );
}

function DeadlinesStep({ data, setData }: { data: OnboardingData; setData: (d: OnboardingData) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Catat deadline tugas atau ujian yang akan datang.
      </p>
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 text-center">
        <Clock className="h-8 w-8 mx-auto mb-2 text-slate-400" />
        <p className="text-sm text-slate-500">Form deadline akan ditampilkan di sini</p>
      </div>
    </div>
  );
}

function DocumentsStep({ data, setData }: { data: OnboardingData; setData: (d: OnboardingData) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Upload foto KTM dan KRS untuk backup digital.
      </p>
      <div className="space-y-3">
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 text-center cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
          <p className="text-sm text-slate-500">Klik untuk upload KTM</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 text-center cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
          <p className="text-sm text-slate-500">Klik untuk upload KRS</p>
        </div>
      </div>
    </div>
  );
}

function ProfileStep({ data, setData }: { data: OnboardingData; setData: (d: OnboardingData) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nama Lengkap</Label>
        <Input placeholder="Masukkan nama lengkap" />
      </div>
      <div className="space-y-2">
        <Label>Jurusan</Label>
        <Input placeholder="Contoh: Teknik Informatika" />
      </div>
      <div className="space-y-2">
        <Label>Angkatan</Label>
        <Input placeholder="Contoh: 2023" />
      </div>
    </div>
  );
}

function NotificationsStep({ data, setData }: { data: OnboardingData; setData: (d: OnboardingData) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-blue-500" />
          <div>
            <p className="font-medium">Notifikasi WhatsApp</p>
            <p className="text-sm text-slate-600">
              Dapatkan pengingat deadline 1 hari sebelum
            </p>
          </div>
        </div>
        <Switch />
      </div>
      <p className="text-sm text-slate-600">
        Anda bisa mengatur notifikasi kapan saja di pengaturan.
      </p>
    </div>
  );
}

function CompleteStep() {
  return (
    <div className="text-center space-y-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 mx-auto">
        <CheckCircle className="h-10 w-10" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">
        Student Kit Siap Digunakan!
      </h3>
      <p className="text-slate-600">
        Anda sudah menyelesaikan setup awal. Mulai kelola kehidupan kampus Anda dengan lebih baik.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        <Badge variant="secondary">Jadwal Kuliah</Badge>
        <Badge variant="secondary">Deadline</Badge>
        <Badge variant="secondary">Dokumen</Badge>
        <Badge variant="secondary">Notifikasi</Badge>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border">
      <Icon className="h-6 w-6 text-blue-500 mb-2" />
      <h4 className="font-semibold text-sm">{title}</h4>
      <p className="text-xs text-slate-600">{description}</p>
    </div>
  );
}

function Badge({ children, variant }: { children: React.ReactNode; variant?: 'default' | 'secondary' }) {
  return (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-xs font-medium',
        variant === 'default'
          ? 'bg-blue-500 text-white'
          : 'bg-slate-200 text-slate-700'
      )}
    >
      {children}
    </span>
  );
}
