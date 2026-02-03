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
import type { AutomationTriggerType } from "@/types/database/automations";
import { Loader2 } from "lucide-react";

const createAutomationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  skill_name: z.string().optional(),
  trigger_type: z.enum(["manual", "schedule", "event"]),
  schedule_cron: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required"),
});

export type CreateAutomationForm = z.infer<typeof createAutomationSchema>;

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

const TRIGGER_TYPES: { value: AutomationTriggerType; label: string }[] = [
  { value: "manual", label: "Manual" },
  { value: "schedule", label: "Schedule" },
  { value: "event", label: "Event" },
];

interface CreateAutomationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAutomationForm) => Promise<void>;
  isSubmitting: boolean;
}

export function CreateAutomationModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreateAutomationModalProps) {
  const form = useForm<CreateAutomationForm>({
    resolver: zodResolver(createAutomationSchema),
    defaultValues: {
      name: "",
      skill_name: "",
      trigger_type: "schedule",
      schedule_cron: "0 8 * * *",
      timezone: "UTC",
    },
  });

  const triggerType = form.watch("trigger_type");

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card" showClose>
        <DialogHeader>
          <DialogTitle>Create automation</DialogTitle>
          <DialogDescription>
            Choose a skill, trigger type, schedule, and timezone.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((data) => onSubmit(data))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="create-name">Name</Label>
            <Input
              id="create-name"
              placeholder="e.g. Daily digest"
              className="bg-background border-border"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-skill">Skill name</Label>
            <Input
              id="create-skill"
              placeholder="e.g. Inbox Zero"
              className="bg-background border-border"
              {...form.register("skill_name")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-trigger">Trigger type</Label>
            <select
              id="create-trigger"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...form.register("trigger_type")}
            >
              {TRIGGER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          {triggerType === "schedule" && (
            <div className="space-y-2">
              <Label htmlFor="create-cron">Schedule (cron)</Label>
              <Input
                id="create-cron"
                placeholder="0 8 * * * (daily 8:00)"
                className="bg-background border-border font-mono text-sm"
                {...form.register("schedule_cron")}
              />
              {form.formState.errors.schedule_cron && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.schedule_cron.message}
                </p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="create-timezone">Timezone</Label>
            <select
              id="create-timezone"
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
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
