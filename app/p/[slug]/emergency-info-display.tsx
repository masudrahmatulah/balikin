import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { HeartPulse, Phone } from 'lucide-react';
import type { EmergencyInformation } from '@/db/schema';

interface EmergencyInfoDisplayProps {
  emergencyInfo: EmergencyInformation;
}

export function EmergencyInfoDisplay({ emergencyInfo }: EmergencyInfoDisplayProps) {
  const hasAnyInfo =
    emergencyInfo.bloodType ||
    emergencyInfo.allergies ||
    emergencyInfo.medicalConditions ||
    emergencyInfo.emergencyContact;

  if (!hasAnyInfo) {
    return null;
  }

  return (
    <Alert className="border-red-200 bg-red-50 mb-6">
      <HeartPulse className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-900">Informasi Medis Darurat</AlertTitle>
      <AlertDescription className="text-red-800 space-y-3">
        {emergencyInfo.bloodType && (
          <div className="flex items-start gap-2">
            <span className="font-medium min-w-[100px]">Golongan Darah:</span>
            <span className="font-bold text-lg">{emergencyInfo.bloodType}</span>
          </div>
        )}

        {emergencyInfo.allergies && (
          <div className="flex items-start gap-2">
            <span className="font-medium min-w-[100px]">Alergi:</span>
            <span>{emergencyInfo.allergies}</span>
          </div>
        )}

        {emergencyInfo.medicalConditions && (
          <div className="flex items-start gap-2">
            <span className="font-medium min-w-[100px]">Kondisi Medis:</span>
            <span>{emergencyInfo.medicalConditions}</span>
          </div>
        )}

        {emergencyInfo.emergencyContact && (
          <div className="pt-3 border-t border-red-200">
            <div className="flex items-start gap-2 mb-2">
              <Phone className="h-4 w-4 mt-0.5" />
              <div className="flex-1">
                <span className="font-medium">Kontak Darurat:</span>{' '}
                {emergencyInfo.emergencyContactName || 'Kontak Darurat'}
              </div>
            </div>
            <WhatsAppButton
              phone={emergencyInfo.emergencyContact}
              message="DARURAT MEDIS: Saya berada di lokasi tag ini dan ada keadaan darurat."
              variant="destructive"
              size="sm"
              className="w-full"
            />
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
