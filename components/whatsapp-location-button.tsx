'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Map, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WhatsAppLocationButtonProps {
  phone: string;
  tagName: string;
  className?: string;
}

export function WhatsAppLocationButton({ phone, tagName, className }: WhatsAppLocationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Clean phone number for WhatsApp
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

  // Message for Live Location instruction
  const liveLocationMessage = `Halo, saya menemukan barang "${tagName}" yang Anda laporkan hilang.

Saya sudah mengirim Live Location saya agar Anda bisa tahu posisi saya saat ini.

Mohon segera hubungi saya untuk koordinasi pengembalian barang.`;

  // Message for Static Location instruction
  const staticLocationMessage = `Halo, saya menemukan barang "${tagName}" yang Anda laporkan hilang.

Saya akan mengirim lokasi saya sekarang.

Mohon segera hubungi saya untuk koordinasi pengembalian barang.`;

  const openWhatsAppWithMessage = (message: string) => {
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleLiveLocation = () => {
    openWhatsAppWithMessage(liveLocationMessage);
    setIsOpen(false);
  };

  const handleStaticLocation = () => {
    openWhatsAppWithMessage(staticLocationMessage);
    setIsOpen(false);
  };

  return (
    <div className={className}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="w-full px-6 py-6 text-base sm:w-auto sm:px-8 border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800"
          >
            <MapPin className="mr-2 h-5 w-5" />
            Share Location via WhatsApp
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-56">
          <DropdownMenuItem onClick={handleLiveLocation} className="cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Map className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Live Location</p>
                <p className="text-xs text-muted-foreground">
                  Kirim lokasi real-time (15 menit / 1 jam / 8 jam)
                </p>
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleStaticLocation} className="cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Current Location</p>
                <p className="text-xs text-muted-foreground">
                  Kirim pin lokasi statis
                </p>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
