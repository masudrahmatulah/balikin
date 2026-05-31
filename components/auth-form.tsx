"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/auth/google-icon";
import { AuthLoadingState } from "@/components/auth/auth-loading-state";
import { AuthSuccessState } from "@/components/auth/auth-success-state";
import { authClient, formatWhatsAppEmail } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up";
type AuthMethod = "email" | "whatsapp";

interface AuthFormProps {
  mode?: AuthMode;
}

const RESEND_COOLDOWN_MS = 60000;
const AUTO_REDIRECT_MS = 500;

export function AuthForm({ mode = "sign-in" }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authMethod, setAuthMethod] = useState<AuthMethod>("whatsapp");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { signIn } = authClient;
      const redirectParam = searchParams.get("redirect") || "/dashboard";

      await signIn.social({
        provider: "google",
        callbackURL: redirectParam,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal login dengan Google. Silakan coba lagi.";
      setError(errorMessage);
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let identifier: string;
      let displayIdentifier: string;

      const { emailOtp } = authClient;

      if (authMethod === "whatsapp") {
        identifier = formatWhatsAppEmail(whatsapp);
        displayIdentifier = whatsapp;
      } else {
        identifier = email;
        displayIdentifier = email;
      }

      const result = await emailOtp.sendVerificationOtp({
        email: identifier,
        type: "sign-in",
      });

      if (result.error) {
        throw new Error(result.error.message || "Gagal mengirim kode OTP.");
      }

      setSuccess(true);

      const redirectParam = searchParams.get("redirect") || "";

      const verifyUrl = new URL("/verify-otp", window.location.origin);
      verifyUrl.searchParams.set("identifier", identifier);
      verifyUrl.searchParams.set("display", displayIdentifier);
      verifyUrl.searchParams.set("method", authMethod);
      verifyUrl.searchParams.set("mode", mode);
      verifyUrl.searchParams.set("name", name);
      if (redirectParam) {
        verifyUrl.searchParams.set("redirect", redirectParam);
      }

      setTimeout(() => {
        router.push(verifyUrl.pathname + verifyUrl.search);
      }, AUTO_REDIRECT_MS);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return <AuthSuccessState destination="halaman verifikasi" />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Formulir autentikasi">
      {error && (
        <div role="alert" aria-live="assertive" className="p-3 rounded-md bg-destructive/15 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        variant="outline"
        className="w-full h-11 bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
      >
        {isGoogleLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" aria-hidden="true" />
            Memproses...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <GoogleIcon />
            Lanjutkan dengan Google
          </span>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground">ATAU</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 rounded-lg bg-muted p-1 sm:grid-cols-2" role="group" aria-label="Pilih metode autentikasi">
        <button
          type="button"
          onClick={() => setAuthMethod("whatsapp")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            authMethod === "whatsapp"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-pressed={authMethod === "whatsapp"}
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          WhatsApp
        </button>
        <button
          type="button"
          onClick={() => setAuthMethod("email")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            authMethod === "email"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-pressed={authMethod === "email"}
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          Email
        </button>
      </div>

      {authMethod === "whatsapp" ? (
        <div className="space-y-2">
          <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
          <Input
            id="whatsapp"
            type="tel"
            inputMode="tel"
            placeholder="08123456789"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="tel"
            aria-describedby="whatsapp-hint"
          />
          <p id="whatsapp-hint" className="text-xs text-muted-foreground">
            Masukkan nomor WhatsApp Anda untuk menerima kode OTP
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="email"
          />
        </div>
      )}

      {mode === "sign-up" && (
        <div className="space-y-2">
          <Label htmlFor="name">Nama</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required={mode === "sign-up"}
            disabled={isLoading}
            autoComplete="name"
          />
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
            Memproses...
          </span>
        ) : mode === "sign-in" ? (
          authMethod === "whatsapp" ? "Masuk dengan WhatsApp" : "Masuk dengan Email"
        ) : (
          "Daftar Akun"
        )}
      </Button>

      <div className="text-center text-sm leading-6 text-muted-foreground">
        <p>
          {mode === "sign-in" ? (
            <>
              Belum punya akun?{" "}
              <a href="/sign-up" className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded">
                Daftar sekarang
              </a>
            </>
          ) : (
            <>
              Sudah punya akun?{" "}
              <a href="/sign-in" className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded">
                Masuk
              </a>
            </>
          )}
        </p>
      </div>
    </form>
  );
}