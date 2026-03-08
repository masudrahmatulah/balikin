'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WhatsAppButtonProps {
  phone: string;
  message?: string;
  label?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function WhatsAppButton({
  phone,
  message = 'Halo, saya menemukan barang ini.',
  label = 'Hubungi via WhatsApp',
  variant = 'default',
  size = 'default',
  className,
}: WhatsAppButtonProps) {
  const handleContact = () => {
    // Format phone number - remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Button
      onClick={handleContact}
      variant={variant}
      size={size}
      className={className}
    >
      <MessageCircle className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
