import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getSession } from "@/api/auth";
import type { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatedPage } from "@/components/AnimatedPage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Shield,
  Link2,
  CreditCard,
  Trash2,
  ChevronRight,
} from "lucide-react";
import {
  useProfile,
  useUserPreferences,
  useUserSecurity,
  useSessions,
  useUpdateUserPreferences,
  useSetTwoFactor,
  useRevokeSession,
} from "@/hooks/useProfile";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { PreferencesPanel } from "@/components/profile/PreferencesPanel";
import { SessionManagementDialog } from "@/components/profile/SessionManagementDialog";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { cn } from "@/lib/utils";

function Avatar({
  src,
  name,
  className,
}: {
  src: string | null;
  name: string;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("h-16 w-16 rounded-full object-cover border border-border", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted text-2xl font-semibold text-muted-foreground",
        className
      )}
      aria-hidden
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { user: u } = await getSession();
      if (!cancelled) setUser(u ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const userId = user?.id;
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile(userId);
  const { data: preferences, isLoading: prefsLoading } = useUserPreferences(userId);
  const { data: security, isLoading: securityLoading } = useUserSecurity(userId);
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions(userId);

  const updatePrefs = useUpdateUserPreferences(userId);
  const setTwoFactor = useSetTwoFactor(userId);
  const revokeSession = useRevokeSession(userId);

  const displayName =
    profile?.display_name ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "User";
  const email = user?.email ?? "";
  const workspaceRole = profile?.workspace_role ?? "member";

  if (profileError) {
    toast.error(profileError.message);
  }

  return (
    <AnimatedPage>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Profile</h1>
          <p className="text-muted-foreground">
            Account and personalization center
          </p>
        </div>

        {/* Profile Summary Card */}
        <Card className="border-border bg-card transition-all duration-300 hover:shadow-card">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {profileLoading ? (
                <Skeleton className="h-16 w-16 rounded-full" />
              ) : (
                <Avatar
                  src={profile?.avatar_url ?? (user?.user_metadata?.avatar_url as string | undefined) ?? null}
                  name={displayName}
                />
              )}
              <div>
                {profileLoading ? (
                  <Skeleton className="h-6 w-32 mb-2" />
                ) : (
                  <CardTitle className="text-xl text-foreground">
                    {displayName}
                  </CardTitle>
                )}
                <CardDescription className="text-muted-foreground">
                  {email}
                </CardDescription>
                {!profileLoading && (
                  <p className="mt-1 text-sm text-muted-foreground capitalize">
                    {workspaceRole}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="shrink-0 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Edit profile
            </Button>
          </CardHeader>
        </Card>

        {/* Edit Profile Form (modal) */}
        <EditProfileDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          userId={userId}
          profile={profile ?? undefined}
          defaultDisplayName={displayName}
          defaultTimezone={profile?.timezone ?? "UTC"}
          defaultLocale={profile?.locale ?? "en"}
          onSuccess={() => {
            if (userId) {
              queryClient.invalidateQueries({ queryKey: ["profile", userId] });
            }
            setEditOpen(false);
            toast.success("Profile updated");
          }}
          onError={(msg) => toast.error(msg)}
        />

        {/* Preferences Panel */}
        <Card className="border-border bg-card transition-all duration-300 hover:shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Settings className="h-5 w-5 text-primary" />
              Assistant preferences
            </CardTitle>
            <CardDescription>
              Tone, verbosity, and default approval level
            </CardDescription>
          </CardHeader>
          <CardContent>
            {prefsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <PreferencesPanel
                preferences={preferences ?? undefined}
                onSave={async (payload) => {
                  await updatePrefs.mutateAsync(payload);
                  toast.success("Preferences saved");
                }}
                isSaving={updatePrefs.isPending}
              />
            )}
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="border-border bg-card transition-all duration-300 hover:shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5 text-primary" />
              Security
            </CardTitle>
            <CardDescription>
              Two-factor authentication and active sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {securityLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-4 py-3">
                <div>
                  <p className="font-medium text-foreground">Two-factor authentication</p>
                  <p className="text-sm text-muted-foreground">
                    {security?.two_factor_enabled
                      ? "2FA is enabled"
                      : "Add an extra layer of security"}
                  </p>
                </div>
                <Switch
                  checked={!!security?.two_factor_enabled}
                  onCheckedChange={(checked) =>
                    setTwoFactor.mutate(checked, {
                      onSuccess: () =>
                        toast.success(
                          checked ? "2FA enabled" : "2FA disabled"
                        ),
                      onError: (e) => toast.error(e.message),
                    })
                  }
                  disabled={setTwoFactor.isPending}
                  aria-label="Toggle two-factor authentication"
                />
              </div>
            )}

            <Separator className="bg-border" />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Active sessions</p>
                <p className="text-sm text-muted-foreground">
                  Manage devices where you're signed in
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSessionsOpen(true)}
                className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                View sessions
              </Button>
            </div>
          </CardContent>
        </Card>

        <SessionManagementDialog
          open={sessionsOpen}
          onOpenChange={setSessionsOpen}
          sessions={sessions}
          isLoading={sessionsLoading}
          onRevoke={async (id) => {
            setRevokingId(id);
            try {
              await revokeSession.mutateAsync(id);
              toast.success("Session revoked");
            } finally {
              setRevokingId(null);
            }
          }}
          revokingId={revokingId}
        />

        {/* Connected Accounts Summary */}
        <Card className="border-border bg-card transition-all duration-300 hover:shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Link2 className="h-5 w-5 text-primary" />
              Connected accounts
            </CardTitle>
            <CardDescription>
              Manage integrations and connectors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connect Gmail, Google Calendar, Slack, and more from workspace
              settings.
            </p>
            <Button variant="outline" asChild className="transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <Link to="/dashboard/settings">
                Manage connectors
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Billing & Plan Link */}
        <Card className="border-border bg-card transition-all duration-300 hover:shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CreditCard className="h-5 w-5 text-primary" />
              Billing & plan
            </CardTitle>
            <CardDescription>
              Subscription and payment management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <Link to="/dashboard/settings">
                View billing
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="border-border bg-card border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete account
            </CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
              className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Delete account
            </Button>
          </CardContent>
        </Card>

        <DeleteAccountDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={async () => {
            // Placeholder: actual delete would call Supabase auth admin or edge function
            toast.error("Account deletion must be completed via support.");
            setDeleteOpen(false);
          }}
          isDeleting={false}
        />
      </div>
    </AnimatedPage>
  );
}
