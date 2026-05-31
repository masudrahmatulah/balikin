import { Loader2 } from "lucide-react";

interface AuthLoadingStateProps {
  message?: string;
}

export function AuthLoadingState({ message = "Memproses..." }: AuthLoadingStateProps) {
  return (
    <div className="text-center py-8" role="status" aria-live="polite">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}