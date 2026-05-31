import type { Metadata } from "next";
import { Suspense } from "react";
import { MessageCircle } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { AuthPageWrapper } from "@/components/auth/auth-page-wrapper";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = buildMetadata({
  title: "Masuk",
  description: "Masuk ke akun Balikin.",
  path: "/sign-in",
  noIndex: true,
});

function SignInForm() {
  return <AuthForm mode="sign-in" />;
}

export default function SignInPage() {
  return (
    <AuthPageWrapper
      title="Masuk ke Balikin"
      description="Masukkan nomor WhatsApp atau email Anda untuk menerima kode OTP"
      icon={<MessageCircle className="h-8 w-8 text-primary" aria-hidden="true" />}
    >
      <Suspense fallback={<AuthFormSkeleton />}>
        <SignInForm />
      </Suspense>
    </AuthPageWrapper>
  );
}

function AuthFormSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Memuat formulir...">
      <div className="h-11 animate-pulse rounded-md bg-muted" />
      <div className="h-11 animate-pulse rounded-md bg-muted" />
      <div className="h-10 animate-pulse rounded-md bg-muted" />
      <div className="h-10 animate-pulse rounded-md bg-muted" />
      <div className="h-10 animate-pulse rounded-md bg-muted" />
    </div>
  );
}