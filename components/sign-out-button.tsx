"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

interface SignOutButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  label?: string;
  onClose?: () => void;
  asChild?: boolean;
}

export function SignOutButton({
  className,
  variant = "ghost",
  size = "sm",
  label = "Keluar",
  onClose,
  asChild = false,
}: SignOutButtonProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      // Use better-auth's signOut method
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            // Force full page reload to clear all client state
            window.location.href = "/";
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
      // Still redirect even if there's an error
      window.location.href = "/";
    } finally {
      setIsSigningOut(false);
      onClose?.();
    }
  };

  // If asChild, return a DropdownMenuItem instead
  if (asChild) {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
      >
        <LogOut className="h-4 w-4" />
        <span>{isSigningOut ? "Keluar..." : label}</span>
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleSignOut}
      disabled={isSigningOut}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isSigningOut ? "Keluar..." : label}
    </Button>
  );
}
