'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WhatsAppButtonProps {
  phone: string;
  message?: string;
  label?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'whatsapp' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  prominent?: boolean;
}

export function WhatsAppButton({
  phone,
  message = 'Halo, saya menemukan barang ini.',
  label = 'Hubungi via WhatsApp',
  variant = 'whatsapp',
  size = 'default',
  className,
  prominent = false,
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
      className={cn(
        'font-semibold',
        variant === 'whatsapp' && prominent && 'rounded-full px-8 py-6 text-base',
        className
      )}
    >
      <span
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-full bg-white/20',
          variant === 'outline' && 'bg-green-100 text-green-700'
        )}
      >
        <MessageCircle className="h-4 w-4" />
      </span>
      {label}
    </Button>
  );
}