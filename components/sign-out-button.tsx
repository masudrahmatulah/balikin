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
}

export function SignOutButton({
  className,
  variant = "ghost",
  size = "sm",
  label = "Keluar",
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
    }
  };

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
