import type { Metadata } from "next";
import { Suspense } from "react";
import { KeyRound } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { AuthPageWrapper } from "@/components/auth/auth-page-wrapper";
import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata: Metadata = buildMetadata({
  title: "Reset Password",
  description: "Buat password baru akun Balikin Anda.",
  path: "/reset-password",
  noIndex: true,
});

export default function ResetPasswordPage() {
  return (
    <AuthPageWrapper
      title="Password Baru"
      description="Masukkan password baru untuk akun Anda"
      icon={<KeyRound className="h-8 w-8 text-primary" aria-hidden="true" />}
    >
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthPageWrapper>
  );
}
