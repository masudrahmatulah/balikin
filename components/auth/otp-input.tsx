import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  method: "email" | "whatsapp";
}

export function OtpInput({ value, onChange, isLoading, method }: OtpInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    onChange(numericValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="otp" className="text-center block">
        Kode Verifikasi
      </Label>
      <div className="flex justify-center">
        <Input
          id="otp"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="000000"
          value={value}
          onChange={handleChange}
          maxLength={6}
          className="h-14 w-full max-w-[220px] text-center text-lg tracking-[0.45em] sm:max-w-[200px]"
          disabled={isLoading}
          autoFocus
          autoComplete="one-time-code"
          aria-describedby="otp-hint"
        />
      </div>
      <p id="otp-hint" className="text-xs text-center text-muted-foreground">
        Masukkan 6 digit kode dari {method === "whatsapp" ? "WhatsApp" : "email"}
      </p>
    </div>
  );
}