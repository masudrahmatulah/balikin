"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Phone, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/auth/otp-input";
import { AuthLoadingState } from "@/components/auth/auth-loading-state";
import { authClient, isWhatsAppIdentifier } from "@/lib/auth-client";

const RESEND_COOLDOWN_SECONDS = 60;
const COOKIE_SETTLE_DELAY_MS = 500;

const OTP_ERRORS: Record<string, string> = {
  EXCEEDED_ATTEMPTS: "Terlalu banyak percobaan. Silakan minta kode OTP baru.",
  EXPIRED: "Kode OTP telah kadaluarsa. Silakan minta kode baru.",
  INVALID: "Kode OTP tidak valid.",
  SERVER_ERROR: "Terjadi kesalahan server. Silakan coba lagi.",
  DEFAULT: "Kode OTP tidak valid atau telah kadaluarsa.",
};

function getAuthErrorMessage(error: unknown): string {
  const maybeError = error as { message?: string; status?: number; statusCode?: number } | null;
  const message = maybeError?.message ?? "";
  const status = maybeError?.status ?? maybeError?.statusCode;

  if (status === 500 || /internal_server_error|server error/i.test(message)) {
    return OTP_ERRORS.SERVER_ERROR;
  }

  if (/attempts|exceeded|too many/i.test(message)) {
    return OTP_ERRORS.EXCEEDED_ATTEMPTS;
  }

  if (/expired/i.test(message)) {
    return OTP_ERRORS.EXPIRED;
  }

  return message || OTP_ERRORS.DEFAULT;
}

async function checkUserRole(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/role");
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.isAdmin ?? false;
  } catch {
    return false;
  }
}

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const identifier = searchParams.get("identifier") || "";
  const display = searchParams.get("display") || identifier;
  const method = searchParams.get("method") || "email";

  const isWhatsApp = isWhatsAppIdentifier(identifier);

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendOTP = async () => {
    if (!identifier || countdown > 0) return;

    setResendLoading(true);
    setError(null);

    try {
      const { emailOtp } = authClient;

      const result = await emailOtp.sendVerificationOtp({
        email: identifier,
        type: "sign-in",
      });

      if (result.error) {
        throw new Error(result.error.message || "Gagal mengirim ulang kode OTP");
      }

      setCountdown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Masukkan 6 digit kode OTP");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { signIn } = authClient;

      const result = await signIn.emailOtp({
        email: identifier,
        otp: otp,
      });

      if (result.error) {
        setError(getAuthErrorMessage(result.error));
        return;
      }

      if (!result.data) {
        setError("Gagal membuat sesi. Silakan coba lagi.");
        return;
      }

      setIsRedirecting(true);

      const [isAdmin] = await Promise.all([
        checkUserRole(),
        new Promise<void>((resolve) => setTimeout(resolve, COOKIE_SETTLE_DELAY_MS)),
      ]);

      const customRedirect = searchParams.get("redirect");
      const finalRedirectUrl = customRedirect || (isAdmin ? "/admin" : "/dashboard");

      window.location.href = finalRedirectUrl;
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (isRedirecting) {
    return <AuthLoadingState message="Login berhasil! Mengalihkan ke dashboard..." />;
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800 sm:p-8">
        <header className="text-center mb-8">
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
              isWhatsApp ? "bg-green-100 dark:bg-green-900/20" : "bg-primary/10"
            }`}
          >
            {isWhatsApp ? (
              <Phone className="h-8 w-8 text-green-600 dark:text-green-400" aria-hidden="true" />
            ) : (
              <Mail className="h-8 w-8 text-primary" aria-hidden="true" />
            )}
          </div>
          <h1 className="text-2xl font-bold break-words">Verifikasi Kode OTP</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Masukkan 6 digit kode yang dikirim ke
          </p>
          <p className="mt-1 break-all text-sm font-medium">{display}</p>
        </header>

        {error && (
          <div role="alert" aria-live="assertive" className="mb-4 p-3 rounded-md bg-destructive/15 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <OtpInput
            value={otp}
            onChange={setOtp}
            isLoading={isLoading}
            method={isWhatsApp ? "whatsapp" : "email"}
          />

          <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Memverifikasi...
              </span>
            ) : (
              "Verifikasi"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Tidak menerima kode?</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResendOTP}
            disabled={resendLoading || countdown > 0}
          >
            {resendLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Mengirim...
              </span>
            ) : countdown > 0 ? (
              `Kirim ulang (${countdown}s)`
            ) : (
              "Kirim ulang kode"
            )}
          </Button>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mx-auto focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
        &copy; {new Date().getFullYear()} Balikin. Smart Lost & Found QR Tag.
      </p>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100" role="status" aria-live="polite">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800 sm:flex sm:items-center sm:justify-center">
        <VerifyOTPContent />
      </div>
    </Suspense>
  );
}