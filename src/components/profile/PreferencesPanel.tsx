import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { UserPreferences } from "@/types/database/user_preferences";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const preferencesSchema = z.object({
  assistant_tone: z.enum(["professional", "friendly", "concise", "detailed"]),
  verbosity: z.enum(["low", "medium", "high"]),
  default_approval_level: z.enum([
    "draft_only",
    "requires_approval",
    "always_allow",
  ]),
});

type PreferencesForm = z.infer<typeof preferencesSchema>;

interface PreferencesPanelProps {
  preferences: UserPreferences | undefined;
  onSave: (data: PreferencesForm) => Promise<void>;
  isSaving: boolean;
}

const TONE_OPTIONS: { value: PreferencesForm["assistant_tone"]; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "concise", label: "Concise" },
  { value: "detailed", label: "Detailed" },
];

const VERBOSITY_OPTIONS: { value: PreferencesForm["verbosity"]; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const APPROVAL_OPTIONS: {
  value: PreferencesForm["default_approval_level"];
  label: string;
}[] = [
  { value: "draft_only", label: "Draft only (safest)" },
  { value: "requires_approval", label: "Requires approval" },
  { value: "always_allow", label: "Always allow" },
];

export function PreferencesPanel({
  preferences,
  onSave,
  isSaving,
}: PreferencesPanelProps) {
  const form = useForm<PreferencesForm>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      assistant_tone: preferences?.assistant_tone ?? "professional",
      verbosity: preferences?.verbosity ?? "medium",
      default_approval_level:
        preferences?.default_approval_level ?? "draft_only",
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((data) => onSave(data))}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label>Assistant tone</Label>
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => form.setValue("assistant_tone", opt.value)}
              className={cn(
                "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                form.watch("assistant_tone") === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-card hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Verbosity</Label>
        <div className="flex flex-wrap gap-2">
          {VERBOSITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => form.setValue("verbosity", opt.value)}
              className={cn(
                "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                form.watch("verbosity") === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-card hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Default approval level</Label>
        <div className="flex flex-wrap gap-2">
          {APPROVAL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                form.setValue("default_approval_level", opt.value)
              }
              className={cn(
                "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                form.watch("default_approval_level") === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-card hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          "Save preferences"
        )}
      </Button>
    </form>
  );
}
