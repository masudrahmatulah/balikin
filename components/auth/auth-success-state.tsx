import { ArrowRight } from "lucide-react";

interface AuthSuccessStateProps {
  destination: string;
}

export function AuthSuccessState({ destination }: AuthSuccessStateProps) {
  return (
    <div className="text-center py-8" role="status" aria-live="polite">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
        <svg
          className="h-6 w-6 text-green-600 dark:text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-2">Kode OTP Terkirim!</h3>
      <p className="text-sm text-muted-foreground">
        Mengalihkan ke halaman verifikasi{" "}
        <span className="inline-flex items-center gap-1">
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </span>
      </p>
    </div>
  );
}