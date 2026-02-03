import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { requestPasswordReset, updatePasswordFromRecovery, hasRecoverySessionInHash } from "@/api/auth";
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";

const requestSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/\d/, "Password must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RequestForm = z.infer<typeof requestSchema>;
type ResetForm = z.infer<typeof resetSchema>;

type Step = "request" | "confirm" | "reset";

export function PasswordReset() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("request");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (hasRecoverySessionInHash()) {
      setStep("reset");
    }
  }, []);

  const requestForm = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onRequest = async (data: RequestForm) => {
    setIsSubmitting(true);
    const { error } = await requestPasswordReset({ email: data.email });
    setIsSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }
    setStep("confirm");
    toast.success("If an account exists for that email, we've sent a reset link.");
  };

  const onReset = async (data: ResetForm) => {
    setIsSubmitting(true);
    const { error } = await updatePasswordFromRecovery({ password: data.password });
    setIsSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }
    setSuccessModalOpen(true);
  };

  const goToLogin = () => {
    setSuccessModalOpen(false);
    navigate("/login", { replace: true });
    toast.success("Your password has been reset. You can now sign in.");
  };

  const watchPassword = resetForm.watch("password");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <AnimatedPage className="w-full max-w-md">
        <header className="mb-8 flex items-center justify-center gap-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back to login"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/" className="font-semibold text-primary text-xl hover:underline">
            ClawCloud
          </Link>
        </header>

        <Card className="border-border bg-card shadow-card rounded-lg overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Password reset</CardTitle>
            <CardDescription>
              {step === "request" &&
                "Enter the email address associated with your account. We'll send you a secure link to reset your password."}
              {step === "confirm" &&
                "If an account exists for that email, we've sent a link to reset your password. Check your inbox and spam folder."}
              {step === "reset" && "Enter your new password below. Use a strong, unique password."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "request" && (
              <form onSubmit={requestForm.handleSubmit(onRequest)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...requestForm.register("email")}
                    className="bg-background border-border focus-visible:ring-primary rounded-lg"
                    aria-invalid={!!requestForm.formState.errors.email}
                  />
                  {requestForm.formState.errors.email && (
                    <p className="text-sm text-destructive" role="alert">
                      {requestForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending…" : "Send reset link"}
                </Button>
              </form>
            )}

            {step === "confirm" && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-sm text-muted-foreground">
                  Didn't receive an email? Check your spam folder or{" "}
                  <button
                    type="button"
                    onClick={() => setStep("request")}
                    className="text-primary hover:underline font-medium"
                  >
                    try again
                  </button>
                  .
                </p>
                <Link to="/help" className="text-sm text-primary hover:underline block">
                  Contact support
                </Link>
              </div>
            )}

            {step === "reset" && (
              <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-password">New password</Label>
                  <div className="relative">
                    <Input
                      id="reset-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      {...resetForm.register("password")}
                      className="bg-background border-border focus-visible:ring-primary rounded-lg pr-10"
                      aria-invalid={!!resetForm.formState.errors.password}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground rounded p-1"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <PasswordStrengthIndicator password={watchPassword} />
                  {resetForm.formState.errors.password && (
                    <p className="text-sm text-destructive" role="alert">
                      {resetForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reset-confirm">Confirm password</Label>
                  <div className="relative">
                    <Input
                      id="reset-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      {...resetForm.register("confirmPassword")}
                      className="bg-background border-border focus-visible:ring-primary rounded-lg pr-10"
                      aria-invalid={!!resetForm.formState.errors.confirmPassword}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground rounded p-1"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={
                        showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive" role="alert">
                      {resetForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating…" : "Reset password"}
                </Button>
              </form>
            )}

            <footer className="pt-4 border-t border-border">
              <Link
                to="/login"
                className="block text-center text-sm text-primary hover:underline"
              >
                Back to Login
              </Link>
            </footer>
          </CardContent>
        </Card>
      </AnimatedPage>

      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent showClose={false} className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-success" aria-hidden />
              Password reset complete
            </DialogTitle>
            <DialogDescription>
              Your password has been updated successfully. You can now sign in with your new
              password.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center pt-2">
            <Button
              onClick={goToLogin}
              className="w-full sm:w-auto rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue to Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
