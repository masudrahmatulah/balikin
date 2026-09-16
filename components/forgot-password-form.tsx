"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthSuccessState } from "@/components/auth/auth-success-state";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.includes("@")) {
      setError("Masukkan alamat email yang valid.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await authClient.forgetPassword({
        email,
        redirectTo: "/reset-password",
      });

      if (result.error) {
        throw new Error(result.error.message || "Gagal mengirim link reset.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return <AuthSuccessState destination="email Anda — klik link reset di dalamnya" />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Formulir lupa password">
      {error && (
        <div role="alert" aria-live="assertive" className="p-3 rounded-md bg-destructive/15 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fp-email">Email</Label>
        <Input
          id="fp-email"
          type="email"
          inputMode="email"
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          autoComplete="email"
        />
        <p className="text-xs text-muted-foreground">
          Link reset berlaku 1 jam. Cek juga folder spam bila tidak masuk.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Mengirim..." : "Kirim Link Reset"}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        <a href="/sign-in" className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded">
          Kembali masuk
        </a>
      </div>
    </form>
  );
}
