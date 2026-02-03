import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserSession } from "@/types/database/user_security";
import { Monitor, Loader2, LogOut } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SessionManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: UserSession[];
  isLoading: boolean;
  onRevoke: (sessionId: string) => Promise<void>;
  revokingId: string | null;
}

export function SessionManagementDialog({
  open,
  onOpenChange,
  sessions,
  isLoading,
  onRevoke,
  revokingId,
}: SessionManagementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-border bg-card" showClose>
        <DialogHeader>
          <DialogTitle>Active sessions</DialogTitle>
          <DialogDescription>
            Devices where you're signed in. Revoke any session you don't
            recognize.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No other sessions. Only this device is recorded.
          </div>
        ) : (
          <ScrollArea className="max-h-[280px] pr-2">
            <ul className="space-y-2">
              {sessions.map((session) => (
                <li
                  key={session.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Monitor className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {session.device_info || "Unknown device"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last active{" "}
                        {formatDistanceToNow(new Date(session.last_active_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRevoke(session.id)}
                    disabled={revokingId === session.id}
                    className="shrink-0 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    aria-label={`Revoke session ${session.device_info || session.id}`}
                  >
                    {revokingId === session.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <LogOut className="mr-1 h-4 w-4" />
                        Revoke
                      </>
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
