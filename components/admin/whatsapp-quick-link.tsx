"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageCircle, Eye, EyeOff, AlertCircle, Copy, Check } from "lucide-react";
import { formatPhoneForUser, canViewPhone, createPrivacyAccessLog } from "@/lib/admin-privacy";

interface WhatsAppQuickLinkProps {
  phone: string | null | undefined;
  userDivision?: string | null;
  recipientName?: string;
  customMessage?: string;
  onLogAccess?: (log: any) => void;
}

/**
 * WhatsApp Quick-Link Component
 * Provides direct WhatsApp access with privacy masking for CS division
 * Shows only last 4 digits by default, with option to reveal for authorized users
 */
export function WhatsAppQuickLink({
  phone,
  userDivision,
  recipientName = "Halo",
  customMessage,
  onLogAccess,
}: WhatsAppQuickLinkProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!phone) {
    return null;
  }

  const canViewFullNumber = canViewPhone(userDivision);
  const displayPhone = isRevealed ? phone : formatPhoneForUser(phone, userDivision);

  const handleReveal = () => {
    if (!canViewFullNumber) return;

    setIsRevealed(true);

    // Log privacy access
    if (onLogAccess) {
      const log = createPrivacyAccessLog(
        "current-admin-id", // Would come from session
        userDivision || "unknown",
        "unmask_phone",
        "target-user-id",
        undefined,
        undefined
      );
      onLogAccess(log);
    }

    // Auto-hide after 30 seconds
    setTimeout(() => setIsRevealed(false), 30000);
  };

  const handleWhatsAppClick = () => {
    const cleanedPhone = phone.replace(/\D/g, '');
    const defaultMessage = `Halo ${recipientName}, saya dari admin Balikin ingin menghubungi Anda.`;
    const message = customMessage || defaultMessage;
    const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Phone Display */}
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
        <span className="text-sm font-medium text-green-700 dark:text-green-400">
          {displayPhone}
        </span>
        {canViewFullNumber && !isRevealed && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={handleReveal}
            title="Reveal phone number"
          >
            <Eye className="w-3 h-3" />
          </Button>
        )}
        {isRevealed && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => setIsRevealed(false)}
            title="Hide phone number"
          >
            <EyeOff className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopyNumber}
          className="gap-1"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <MessageCircle className="w-4 h-4" />
              Chat
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>WhatsApp Confirmation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  You're about to open WhatsApp to chat with this customer. This will reveal your phone number to them.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Phone:</strong> {phone}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Customer:</strong> {recipientName}
                </p>
                {customMessage && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Message:</strong> {customMessage}
                  </p>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <DialogTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogTrigger>
                <Button onClick={handleWhatsAppClick} className="gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Open WhatsApp
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Privacy Notice */}
      {canViewFullNumber && !isRevealed && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Phone number masked for privacy. Click eye icon to reveal.
        </p>
      )}
    </div>
  );
}
