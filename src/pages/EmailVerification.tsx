import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatedPage } from "@/components/AnimatedPage";
import { Footer } from "@/components/layout/Footer";
import {
  getSession,
  isUserEmailVerified,
  resendVerificationEmail,
} from "@/api/auth";
import {
  Mail,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Loader2,
} from "lucide-react";

const RESEND_COOLDOWN_SECONDS = 60;

export function EmailVerification() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [resendConfirmOpen, setResendConfirmOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { user } = await getSession();
      if (!mounted) return;
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }
      setUserEmail(user.email ?? null);
      setIsVerified(isUserEmailVerified(user));
      setIsLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const t = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [cooldownRemaining]);

  const handleResendClick = () => {
    if (cooldownRemaining > 0) return;
    setResendConfirmOpen(true);
  };

  const handleResendConfirm = async () => {
    if (!userEmail) {
      toast.error("Email not found. Please sign in again.");
      setResendConfirmOpen(false);
      return;
    }
    setIsResending(true);
    const { error } = await resendVerificationEmail(userEmail);
    setIsResending(false);
    setResendConfirmOpen(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Verification email sent. Check your inbox and spam folder.");
    setCooldownRemaining(RESEND_COOLDOWN_SECONDS);
  };

  const handleContinueToApp = () => {
    navigate("/dashboard", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
          <p className="text-sm text-muted-foreground">Checking verification status…</p>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <AnimatedPage className="w-full max-w-md">
            <header className="mb-8 text-center">
              <Link to="/" className="font-semibold text-primary text-xl hover:underline">
                ClawCloud
              </Link>
            </header>
            <Card className="border-border bg-card shadow-card rounded-lg overflow-hidden">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
                  <CheckCircle2 className="h-6 w-6 text-success" aria-hidden />
                </div>
                <CardTitle className="text-center text-xl">Email verified</CardTitle>
                <CardDescription className="text-center">
                  Your email is verified. You can continue to the app.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleContinueToApp}
                  className="w-full rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Continue to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <Link to="/login" className="text-primary hover:underline">
                    Back to Login
                  </Link>
                </p>
              </CardContent>
            </Card>
          </AnimatedPage>
        </div>
        <Footer />
      </div>
    );
  }

  const cooldownPercent = (cooldownRemaining / RESEND_COOLDOWN_SECONDS) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <AnimatedPage className="w-full max-w-md">
          <header className="mb-8 text-center">
            <Link to="/" className="font-semibold text-primary text-xl hover:underline">
              ClawCloud
            </Link>
          </header>

          <Card className="border-border bg-card shadow-card rounded-lg overflow-hidden">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <Mail className="h-6 w-6 text-primary" aria-hidden />
              </div>
              <CardTitle className="text-center text-xl">Verify your email</CardTitle>
              <CardDescription className="text-center">
                We need to confirm your email address before you can access the app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Verification notice banner */}
              <div
                className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-foreground"
                role="status"
                aria-live="polite"
              >
                <p className="font-medium text-foreground">Next steps</p>
                <ol className="mt-2 list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Check your inbox{userEmail ? ` (${userEmail})` : ""} for a verification link.</li>
                  <li>Click the link to verify your account.</li>
                  <li>Return here or open the app to continue.</li>
                </ol>
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={handleResendClick}
                  disabled={cooldownRemaining > 0}
                  className="w-full rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
                  aria-label={
                    cooldownRemaining > 0
                      ? `Resend available in ${cooldownRemaining} seconds`
                      : "Resend verification email"
                  }
                >
                  {cooldownRemaining > 0
                    ? `Resend in ${cooldownRemaining}s`
                    : "Resend verification email"}
                </Button>
                {cooldownRemaining > 0 && (
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuenow={100 - cooldownPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Resend cooldown progress"
                  >
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-1000 ease-linear"
                      style={{ width: `${100 - cooldownPercent}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <Link
                  to="/help"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <HelpCircle className="h-4 w-4" aria-hidden />
                  Contact support
                </Link>
              </div>

              <footer className="border-t border-border pt-4">
                <Link
                  to="/login"
                  className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to Login
                </Link>
              </footer>
            </CardContent>
          </Card>
        </AnimatedPage>
      </div>

      <Footer />

      <Dialog open={resendConfirmOpen} onOpenChange={setResendConfirmOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card" showClose={true}>
          <DialogHeader>
            <DialogTitle>Resend verification email</DialogTitle>
            <DialogDescription>
              We'll send another verification link to your email. After sending, you'll need to
              wait {RESEND_COOLDOWN_SECONDS} seconds before resending again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setResendConfirmOpen(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResendConfirm}
              disabled={isResending}
              className="rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Sending…
                </>
              ) : (
                "Send again"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
