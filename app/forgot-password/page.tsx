import type { Metadata } from "next";
import { Suspense } from "react";
import { KeyRound } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { AuthPageWrapper } from "@/components/auth/auth-page-wrapper";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata: Metadata = buildMetadata({
  title: "Lupa Password",
  description: "Reset password akun Balikin Anda.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return (
    <AuthPageWrapper
      title="Lupa Password"
      description="Masukkan email akun Anda, kami kirim link reset password"
      icon={<KeyRound className="h-8 w-8 text-primary" aria-hidden="true" />}
    >
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </AuthPageWrapper>
  );
}
