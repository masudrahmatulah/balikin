"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  pendingText?: string;
}

export function SubmitButton({
  children,
  pendingText = "Submitting...",
  ...props
}: SubmitButtonProps) {
  const [isPending, setIsPending] = useState(false);

  return (
    <Button
      type="submit"
      disabled={isPending || props.disabled}
      onClick={() => setIsPending(true)}
      {...props}
    >
      {isPending ? pendingText : children}
    </Button>
  );
}
