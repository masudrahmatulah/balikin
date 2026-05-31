import type { Metadata } from "next";
import { Suspense } from "react";
import { MessageCircle } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { AuthPageWrapper } from "@/components/auth/auth-page-wrapper";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = buildMetadata({
  title: "Daftar",
  description: "Buat akun Balikin untuk mulai memakai tag QR code.",
  path: "/sign-up",
  noIndex: true,
});

function SignUpForm() {
  return <AuthForm mode="sign-up" />;
}

export default function SignUpPage() {
  return (
    <AuthPageWrapper
      title="Daftar Akun Balikin"
      description="Buat akun dengan nomor WhatsApp atau email untuk mulai menggunakan Balikin"
      icon={<MessageCircle className="h-8 w-8 text-primary" aria-hidden="true" />}
    >
      <Suspense fallback={<AuthFormSkeleton />}>
        <SignUpForm />
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
      <div className="h-10 animate-pulse rounded-md bg-muted" />
    </div>
  );
}