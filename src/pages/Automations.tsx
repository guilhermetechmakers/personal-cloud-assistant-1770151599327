import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { getSession } from "@/api/auth";
import type { User } from "@supabase/supabase-js";
import {
  Zap,
  Plus,
  Pencil,
  ExternalLink,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Power,
  PowerOff,
} from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAutomations,
  useUpdateAutomation,
  useDeleteAutomation,
  useCreateAutomation,
  useRunsInRange,
  useLastRun,
} from "@/hooks/useAutomations";
import type { Automation } from "@/types/database/automations";
import type { AutomationTriggerType } from "@/types/database/automations";
import { CreateAutomationModal } from "@/components/automations/CreateAutomationModal";
import { EditAutomationModal } from "@/components/automations/EditAutomationModal";
import { BulkActionsDialog } from "@/components/automations/BulkActionsDialog";
import type { BulkAction } from "@/components/automations/BulkActionsDialog";
import type { CreateAutomationForm } from "@/components/automations/CreateAutomationModal";
import { cn } from "@/lib/utils";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  parseISO,
} from "date-fns";

function formatTriggerLabel(triggerType: string, scheduleCron: string | null): string {
  if (triggerType === "manual") return "Manual";
  if (triggerType === "event") return "Event";
  if (scheduleCron) {
    if (scheduleCron === "0 8 * * *") return "Daily 08:00";
    if (scheduleCron === "0 9 * * 1") return "Weekly Mon 09:00";
    return scheduleCron;
  }
  return "—";
}

function NextRunCell({ automation }: { automation: Automation }) {
  const cron = automation.schedule_cron;
  if (automation.trigger_type !== "schedule" || !cron) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="text-muted-foreground font-mono text-sm">
      {formatTriggerLabel(automation.trigger_type, cron)}
    </span>
  );
}

function AutomationRow({
  automation,
  isSelected,
  onToggleSelect,
  onToggleStatus,
  onEdit,
  onViewDetails,
  isUpdating,
}: {
  automation: Automation;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleStatus: (a: Automation) => void;
  onEdit: (a: Automation) => void;
  onViewDetails: (a: Automation) => void;
  isUpdating: boolean;
}) {
  return (
    <tr
      className={cn(
        "border-b border-border transition-colors hover:bg-card/80",
        isSelected && "bg-primary/5"
      )}
    >
      <td className="p-3 align-middle">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(automation.id)}
          className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-2 focus:ring-ring"
          aria-label={`Select ${automation.name}`}
        />
      </td>
      <td className="p-3 font-medium text-foreground">{automation.name}</td>
      <td className="p-3">
        {formatTriggerLabel(automation.trigger_type, automation.schedule_cron)}
      </td>
      <td className="p-3">
        <NextRunCell automation={automation} />
      </td>
      <td className="p-3">
        <Switch
          checked={automation.status === "enabled"}
          onCheckedChange={() => onToggleStatus(automation)}
          disabled={isUpdating}
          aria-label={automation.status === "enabled" ? "Disable" : "Enable"}
        />
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(automation)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(automation)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="View details"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function AuditSnapshotCard({ automationId }: { automationId: string }) {
  const { data: lastRun, isLoading, error } = useLastRun(automationId);
  if (isLoading) return <Skeleton className="h-16 rounded-lg" />;
  if (error || !lastRun) {
    return (
      <p className="text-sm text-muted-foreground">No runs yet</p>
    );
  }
  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <p className="text-sm font-medium text-foreground">
          Last run: {format(parseISO(lastRun.run_time), "PPp")}
        </p>
        <p className="text-xs text-muted-foreground capitalize">{lastRun.status}</p>
        {lastRun.result_summary && (
          <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
            {lastRun.result_summary}
          </p>
        )}
      </div>
      <Button variant="outline" size="sm" asChild>
        <a href={`/dashboard/automations?run=${lastRun.id}`}>View details</a>
      </Button>
    </div>
  );
}

function RunCalendar({
  runs,
  currentMonth,
  onPrevMonth,
  onNextMonth,
}: {
  runs: { run_time: string }[];
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });
  const runsByDay = useMemo(() => {
    const map: Record<string, number> = {};
    runs.forEach((r) => {
      const d = format(parseISO(r.run_time), "yyyy-MM-dd");
      map[d] = (map[d] ?? 0) + 1;
    });
    return map;
  }, [runs]);

  const padStart = start.getDay();
  const padEnd = 42 - padStart - days.length;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Run calendar
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-foreground min-w-[120px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-xs font-medium text-muted-foreground py-1">
              {d}
            </div>
          ))}
          {Array.from({ length: padStart }).map((_, i) => (
            <div key={`pad-${i}`} className="h-8" />
          ))}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const count = runsByDay[key] ?? 0;
            const isCurrentMonth = isSameMonth(day, currentMonth);
            return (
              <div
                key={key}
                className={cn(
                  "h-8 flex flex-col items-center justify-center rounded-md text-sm relative",
                  isCurrentMonth ? "text-foreground" : "text-muted-foreground/50",
                  count > 0 && "bg-primary/20 text-primary font-medium"
                )}
              >
                {format(day, "d")}
                {count > 0 && (
                  <span className="text-[10px] text-primary leading-tight" aria-hidden>
                    {count}
                  </span>
                )}
              </div>
            );
          })}
          {Array.from({ length: padEnd }).map((_, i) => (
            <div key={`pad-end-${i}`} className="h-8" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function Automations() {
  const [user, setUser] = useState<User | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkAction | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<"all" | "enabled" | "disabled">("all");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  useEffect(() => {
    let mounted = true;
    getSession().then(({ user: u }) => {
      if (mounted) setUser(u ?? null);
    });
    return () => { mounted = false; };
  }, []);

  const userId = user?.id;
  const filters = useMemo(
    () =>
      filterStatus === "all"
        ? undefined
        : { status: filterStatus as "enabled" | "disabled" },
    [filterStatus]
  );
  const { data: automations = [], isLoading, error } = useAutomations(userId, filters);
  const createMutation = useCreateAutomation(userId);
  const updateMutation = useUpdateAutomation();
  const deleteMutation = useDeleteAutomation(userId);

  const rangeStart = format(startOfMonth(calendarMonth), "yyyy-MM-dd'T'00:00:00'Z'");
  const rangeEnd = format(endOfMonth(calendarMonth), "yyyy-MM-dd'T'23:59:59'Z'");
  const { data: runsInRange = [] } = useRunsInRange(userId, rangeStart, rangeEnd);

  const handleCreateSubmit = async (data: CreateAutomationForm) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        skill_name: data.skill_name || null,
        trigger_type: data.trigger_type,
        schedule_cron: data.schedule_cron || null,
        timezone: data.timezone,
        status: "enabled",
      });
      toast.success("Automation created");
      setCreateOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create automation");
    }
  };

  const handleEditSubmit = async (data: {
    name: string;
    skill_name?: string;
    trigger_type: AutomationTriggerType;
    schedule_cron?: string;
    timezone: string;
  }) => {
    if (!editingAutomation) return;
    try {
      await updateMutation.mutateAsync({
        id: editingAutomation.id,
        payload: {
          name: data.name,
          skill_name: data.skill_name || null,
          trigger_type: data.trigger_type,
          schedule_cron: data.schedule_cron || null,
          timezone: data.timezone,
        },
      });
      toast.success("Automation updated");
      setEditOpen(false);
      setEditingAutomation(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update automation");
    }
  };

  const handleToggleStatus = (automation: Automation) => {
    const next = automation.status === "enabled" ? "disabled" : "enabled";
    updateMutation.mutate(
      { id: automation.id, payload: { status: next } },
      {
        onSuccess: () => toast.success(next === "enabled" ? "Automation enabled" : "Automation disabled"),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
      }
    );
  };

  const handleBulkConfirm = () => {
    if (!bulkAction || selectedIds.size === 0) return;
    if (bulkAction === "delete") {
      Promise.all(
        Array.from(selectedIds).map((id) => deleteMutation.mutateAsync(id))
      )
        .then(() => {
          toast.success("Automations deleted");
          setBulkOpen(false);
          setBulkAction(null);
          setSelectedIds(new Set());
        })
        .catch((e) => toast.error(e instanceof Error ? e.message : "Delete failed"));
    } else {
      const status = bulkAction === "enable" ? "enabled" : "disabled";
      Promise.all(
        Array.from(selectedIds).map((id) =>
          updateMutation.mutateAsync({ id, payload: { status } })
        )
      )
        .then(() => {
          toast.success(`Automations ${status}`);
          setBulkOpen(false);
          setBulkAction(null);
          setSelectedIds(new Set());
        })
        .catch((e) => toast.error(e instanceof Error ? e.message : "Update failed"));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const firstAutomationId = automations[0]?.id;

  return (
    <AnimatedPage>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Zap className="h-7 w-7 text-primary" />
              Automations & Scheduler
            </h1>
            <p className="text-muted-foreground">
              Manage scheduled runs and automation rules
            </p>
          </div>
          <Button
            className="transition-transform hover:scale-[1.02]"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create automation
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>Automation list</CardTitle>
                  <CardDescription>
                    Name, trigger, next run time, and status
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(e.target.value as "all" | "enabled" | "disabled")
                    }
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:ring-2 focus:ring-ring"
                    aria-label="Filter by status"
                  >
                    <option value="all">All</option>
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {selectedIds.size > 0 && (
                  <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2 bg-muted/30">
                    <span className="text-sm text-muted-foreground">
                      {selectedIds.size} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBulkAction("enable");
                        setBulkOpen(true);
                      }}
                    >
                      <Power className="h-3 w-3" />
                      Enable
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBulkAction("disable");
                        setBulkOpen(true);
                      }}
                    >
                      <PowerOff className="h-3 w-3" />
                      Disable
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setBulkAction("delete");
                        setBulkOpen(true);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                )}
                {isLoading ? (
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : error ? (
                  <div className="p-6">
                    <p className="text-sm text-destructive">
                      {error instanceof Error ? error.message : "Failed to load automations"}
                    </p>
                  </div>
                ) : automations.length === 0 ? (
                  <div className="p-8 text-center">
                    <Zap className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No automations yet. Create one to get started.
                    </p>
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={() => setCreateOpen(true)}
                    >
                      Create automation
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full" role="grid">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-10">
                            <span className="sr-only">Select</span>
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Name
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Trigger
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Next run
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Status
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {automations.map((a) => (
                          <AutomationRow
                            key={a.id}
                            automation={a}
                            isSelected={selectedIds.has(a.id)}
                            onToggleSelect={toggleSelect}
                            onToggleStatus={handleToggleStatus}
                            onEdit={(atm) => {
                              setEditingAutomation(atm);
                              setEditOpen(true);
                            }}
                            onViewDetails={() => {}}
                            isUpdating={updateMutation.isPending}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <RunCalendar
              runs={runsInRange}
              currentMonth={calendarMonth}
              onPrevMonth={() => setCalendarMonth((d) => subMonths(d, 1))}
              onNextMonth={() => setCalendarMonth((d) => addMonths(d, 1))}
            />
          </div>

          <aside className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base">Audit snapshot</CardTitle>
                <CardDescription>Last run result</CardDescription>
              </CardHeader>
              <CardContent>
                {firstAutomationId ? (
                  <AuditSnapshotCard automationId={firstAutomationId} />
                ) : (
                  <p className="text-sm text-muted-foreground">No automations yet</p>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <CreateAutomationModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateSubmit}
        isSubmitting={createMutation.isPending}
      />
      <EditAutomationModal
        open={editOpen}
        onOpenChange={(open) => {
          if (!open) setEditingAutomation(null);
          setEditOpen(open);
        }}
        automation={editingAutomation}
        onSubmit={handleEditSubmit}
        isSubmitting={updateMutation.isPending}
      />
      <BulkActionsDialog
        open={bulkOpen}
        onOpenChange={(open) => {
          if (!open) setBulkAction(null);
          setBulkOpen(open);
        }}
        action={bulkAction}
        selectedCount={selectedIds.size}
        onConfirm={handleBulkConfirm}
        isSubmitting={
          updateMutation.isPending || deleteMutation.isPending
        }
      />
    </AnimatedPage>
  );
}
