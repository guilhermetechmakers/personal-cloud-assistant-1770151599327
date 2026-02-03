import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertProfile } from "@/api/profile";
import type { Profile } from "@/types/database/profiles";
import { Loader2 } from "lucide-react";

const editProfileSchema = z.object({
  display_name: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required"),
  locale: z.string().min(1, "Locale is required"),
});

type EditProfileForm = z.infer<typeof editProfileSchema>;

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | undefined;
  profile: Profile | undefined;
  defaultDisplayName: string;
  defaultTimezone: string;
  defaultLocale: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
];

const LOCALES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "ja", label: "Japanese" },
];

export function EditProfileDialog({
  open,
  onOpenChange,
  userId,
  profile,
  defaultDisplayName,
  defaultTimezone,
  defaultLocale,
  onSuccess,
  onError,
}: EditProfileDialogProps) {
  const form = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      display_name: profile?.display_name ?? defaultDisplayName,
      timezone: profile?.timezone ?? defaultTimezone,
      locale: profile?.locale ?? defaultLocale,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        display_name: profile?.display_name ?? defaultDisplayName,
        timezone: profile?.timezone ?? defaultTimezone,
        locale: profile?.locale ?? defaultLocale,
      });
    }
  }, [open, profile?.display_name, profile?.timezone, profile?.locale, defaultDisplayName, defaultTimezone, defaultLocale]);

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset();
    onOpenChange(next);
  };

  const onSubmit = async (data: EditProfileForm) => {
    if (!userId) {
      onError("Not signed in");
      return;
    }
    try {
      const { error } = await upsertProfile(userId, {
        display_name: data.display_name || null,
        timezone: data.timezone,
        locale: data.locale,
      });
      if (error) {
        onError(error);
        return;
      }
      onSuccess();
      handleOpenChange(false);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Failed to update profile");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card" showClose>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your display name, timezone, and locale.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-display-name">Display name</Label>
            <Input
              id="edit-display-name"
              placeholder="Your name"
              className="bg-background border-border"
              {...form.register("display_name")}
            />
            {form.formState.errors.display_name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.display_name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-timezone">Timezone</Label>
            <select
              id="edit-timezone"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...form.register("timezone")}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            {form.formState.errors.timezone && (
              <p className="text-sm text-destructive">
                {form.formState.errors.timezone.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-locale">Locale</Label>
            <select
              id="edit-locale"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...form.register("locale")}
            >
              {LOCALES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            {form.formState.errors.locale && (
              <p className="text-sm text-destructive">
                {form.formState.errors.locale.message}
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
