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
import type { Automation, AutomationTriggerType } from "@/types/database/automations";
import { Loader2 } from "lucide-react";

const editAutomationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  skill_name: z.string().optional(),
  trigger_type: z.enum(["manual", "schedule", "event"]),
  schedule_cron: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required"),
});

type EditAutomationForm = z.infer<typeof editAutomationSchema>;

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

interface EditAutomationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automation: Automation | null;
  onSubmit: (data: EditAutomationForm) => Promise<void>;
  isSubmitting: boolean;
}

export function EditAutomationModal({
  open,
  onOpenChange,
  automation,
  onSubmit,
  isSubmitting,
}: EditAutomationModalProps) {
  const form = useForm<EditAutomationForm>({
    resolver: zodResolver(editAutomationSchema),
    defaultValues: {
      name: "",
      skill_name: "",
      trigger_type: "schedule",
      schedule_cron: "",
      timezone: "UTC",
    },
  });

  useEffect(() => {
    if (open && automation) {
      form.reset({
        name: automation.name,
        skill_name: automation.skill_name ?? "",
        trigger_type: automation.trigger_type,
        schedule_cron: automation.schedule_cron ?? "",
        timezone: automation.timezone,
      });
    }
  }, [open, automation]);

  const triggerType = form.watch("trigger_type");

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card" showClose>
        <DialogHeader>
          <DialogTitle>Edit automation</DialogTitle>
          <DialogDescription>
            Update schedule, triggers, and timezone.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((data) => onSubmit(data))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
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
            <Label htmlFor="edit-skill">Skill name</Label>
            <Input
              id="edit-skill"
              placeholder="e.g. Inbox Zero"
              className="bg-background border-border"
              {...form.register("skill_name")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-trigger">Trigger type</Label>
            <select
              id="edit-trigger"
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
              <Label htmlFor="edit-cron">Schedule (cron)</Label>
              <Input
                id="edit-cron"
                placeholder="0 8 * * *"
                className="bg-background border-border font-mono text-sm"
                {...form.register("schedule_cron")}
              />
            </div>
          )}
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
