"use client";

import { AlertCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SessionTimeoutWarningProps {
  show: boolean;
  timeRemaining: number;
  onExtend: () => void;
  onLogout: () => void;
  formatTime: (seconds: number) => string;
}

/**
 * Session Timeout Warning Component
 * Shows warning dialog when session is about to expire
 */
export function SessionTimeoutWarning({
  show,
  timeRemaining,
  onExtend,
  onLogout,
  formatTime,
}: SessionTimeoutWarningProps) {
  return (
    <AlertDialog open={show}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            Session Timeout Warning
          </AlertDialogTitle>
          <AlertDialogDescription>
            Your session will expire in {formatTime(timeRemaining)} due to inactivity.
            You can extend your session or log out now.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {formatTime(timeRemaining)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Time remaining
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={onLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout Now
          </Button>
          <Button onClick={onExtend}>
            Extend Session
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
