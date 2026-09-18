"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthSuccessState } from "@/components/auth/auth-success-state";
import { authClient, formatWhatsAppEmail } from "@/lib/auth-client";

type ResetMethod = "email" | "whatsapp";

export function ForgotPasswordForm() {
  const [method, setMethod] = useState<ResetMethod>("whatsapp");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (method === "email") {
        if (!email.includes("@")) {
          throw new Error("Masukkan alamat email yang valid.");
        }

        const result = await authClient.forgetPassword({
          email,
          redirectTo: "/reset-password",
        });

        if (result.error) throw new Error(result.error.message || "Gagal mengirim link reset.");
        setSuccess(true);
        return;
      }

      const identifier = formatWhatsAppEmail(whatsapp);

      if (step === "request") {
        if (whatsapp.replace(/\D/g, "").length < 9) {
          throw new Error("Masukkan nomor WhatsApp yang valid.");
        }

        const result = await authClient.emailOtp.requestPasswordResetEmailOTP({
          email: identifier,
        });

        if (result.error) throw new Error(result.error.message || "Gagal mengirim OTP WhatsApp.");
        setStep("verify");
      } else {
        if (otp.length !== 6) throw new Error("Masukkan OTP 6 digit.");
        if (password.length < 8 || password.length > 64) {
          throw new Error("Password baru harus terdiri dari 8 sampai 64 karakter.");
        }
        if (password !== confirmation) throw new Error("Konfirmasi password tidak sama.");

        const result = await authClient.emailOtp.resetPasswordEmailOTP({
          email: identifier,
          otp,
          password,
        });

        if (result.error) throw new Error(result.error.message || "Gagal mereset password.");
        setSuccess(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthSuccessState
        destination={method === "email" ? "email Anda — klik link reset di dalamnya" : "password baru Anda sudah aktif"}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Formulir lupa password">
      <div className="grid grid-cols-2 gap-2 rounded-lg border border-border p-1">
        <button
          type="button"
          onClick={() => { setMethod("whatsapp"); setStep("request"); setError(null); }}
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${method === "whatsapp" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
        >
          WhatsApp
        </button>
        <button
          type="button"
          onClick={() => { setMethod("email"); setStep("request"); setError(null); }}
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${method === "email" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
        >
          Email
        </button>
      </div>

      {error && (
        <div role="alert" aria-live="assertive" className="rounded-md border border-destructive/20 bg-destructive/15 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {method === "email" ? (
        <div className="space-y-2">
          <Label htmlFor="fp-email">Email</Label>
          <Input id="fp-email" type="email" inputMode="email" placeholder="nama@email.com" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={isLoading} autoComplete="email" />
          <p className="text-xs text-muted-foreground">Link reset berlaku 1 jam. Cek juga folder spam.</p>
        </div>
      ) : step === "request" ? (
        <div className="space-y-2">
          <Label htmlFor="fp-whatsapp">Nomor WhatsApp</Label>
          <Input id="fp-whatsapp" type="tel" inputMode="tel" placeholder="08xxxxxxxxxx" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} required disabled={isLoading} autoComplete="tel" />
          <p className="text-xs text-muted-foreground">OTP reset akan dikirim melalui WhatsApp.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">OTP sudah dikirim ke WhatsApp {whatsapp}.</p>
          <div className="space-y-2">
            <Label htmlFor="fp-otp">OTP</Label>
            <Input id="fp-otp" inputMode="numeric" maxLength={6} placeholder="123456" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} required disabled={isLoading} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fp-new-password">Password Baru</Label>
              <Input id="fp-new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={64} required disabled={isLoading} autoComplete="new-password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fp-confirm-password">Konfirmasi Password</Label>
              <Input id="fp-confirm-password" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={8} maxLength={64} required disabled={isLoading} autoComplete="new-password" />
            </div>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Memproses..." : method === "email" ? "Kirim Link Reset" : step === "request" ? "Kirim OTP WhatsApp" : "Reset Password"}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        <a href="/sign-in" className="rounded text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">Kembali masuk</a>
      </div>
    </form>
  );
}
