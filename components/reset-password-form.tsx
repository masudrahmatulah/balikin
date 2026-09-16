"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthSuccessState } from "@/components/auth/auth-success-state";
import { authClient } from "@/lib/auth-client";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Link reset tidak valid. Minta link baru di halaman lupa password.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await authClient.resetPassword({ newPassword: password, token });

      if (result.error) {
        throw new Error(result.error.message || "Gagal mereset password.");
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/sign-in";
      }, 1500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return <AuthSuccessState destination="halaman masuk — silakan login dengan password baru" />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Formulir reset password">
      {error && (
        <div role="alert" aria-live="assertive" className="p-3 rounded-md bg-destructive/15 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="rp-password">Password Baru</Label>
        <Input
          id="rp-password"
          type="password"
          placeholder="Minimal 8 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          disabled={isLoading}
          autoComplete="new-password"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rp-confirm">Konfirmasi Password</Label>
        <Input
          id="rp-confirm"
          type="password"
          placeholder="Ulangi password baru"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          disabled={isLoading}
          autoComplete="new-password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Memproses...
          </span>
        ) : (
          "Simpan Password Baru"
        )}
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
