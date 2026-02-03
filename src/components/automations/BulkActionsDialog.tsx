import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export type BulkAction = "enable" | "disable" | "delete";

interface BulkActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: BulkAction | null;
  selectedCount: number;
  onConfirm: () => void;
  isSubmitting: boolean;
}

const LABELS: Record<BulkAction, { title: string; description: string; button: string }> = {
  enable: {
    title: "Enable automations",
    description: "Enable the selected automations. They will run according to their schedule.",
    button: "Enable all",
  },
  disable: {
    title: "Disable automations",
    description: "Disable the selected automations. They will not run until re-enabled.",
    button: "Disable all",
  },
  delete: {
    title: "Delete automations",
    description: "Permanently delete the selected automations and their run history. This cannot be undone.",
    button: "Delete all",
  },
};

export function BulkActionsDialog({
  open,
  onOpenChange,
  action,
  selectedCount,
  onConfirm,
  isSubmitting,
}: BulkActionsDialogProps) {
  if (!action) return null;
  const labels = LABELS[action];
  const isDestructive = action === "delete";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card" showClose>
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>
            {labels.description} You have selected {selectedCount} automation
            {selectedCount !== 1 ? "s" : ""}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              labels.button
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
