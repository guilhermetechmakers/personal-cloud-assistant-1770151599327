import { useMemo } from "react";
import { cn } from "@/lib/utils";

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

function computeStrength(password: string): { level: PasswordStrength; score: number } {
  if (!password) return { level: "weak", score: 0 };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  const level: PasswordStrength =
    score <= 1 ? "weak" : score <= 2 ? "fair" : score <= 3 ? "good" : "strong";
  return { level, score };
}

const strengthConfig: Record<PasswordStrength, { label: string; color: string }> = {
  weak: { label: "Weak", color: "bg-destructive" },
  fair: { label: "Fair", color: "bg-warning" },
  good: { label: "Good", color: "bg-primary" },
  strong: { label: "Strong", color: "bg-success" },
};

export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  const { level } = useMemo(() => computeStrength(password), [password]);
  const config = strengthConfig[level];

  if (!password) return null;

  const levelIndex = (["weak", "fair", "good", "strong"] as const).indexOf(level);

  return (
    <div className={cn("space-y-1.5", className)} role="status" aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-200",
              i <= levelIndex ? config.color : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Password strength: <span className="font-medium text-foreground">{config.label}</span>
      </p>
    </div>
  );
}
