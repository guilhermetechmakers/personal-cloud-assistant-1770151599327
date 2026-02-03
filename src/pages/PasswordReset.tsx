import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedPage } from "@/components/AnimatedPage";

const requestSchema = z.object({
  email: z.string().email("Invalid email"),
});

const resetSchema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RequestForm = z.infer<typeof requestSchema>;
type ResetForm = z.infer<typeof resetSchema>;

export function PasswordReset() {
  const token = new URLSearchParams(window.location.search).get("token") ?? "";
  const [step, setStep] = useState<"request" | "confirm" | "reset">(
    token ? "reset" : "request"
  );

  useEffect(() => {
    if (token) setStep("reset");
  }, [token]);

  const requestForm = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onRequest = (data: RequestForm) => {
    console.log("Request reset", data);
    setStep("confirm");
  };

  const onReset = (data: ResetForm) => {
    console.log("Reset password", { token, ...data });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <AnimatedPage className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="font-semibold text-primary text-xl">
            ClawCloud
          </Link>
        </div>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Password reset</CardTitle>
            <CardDescription>
              {step === "request" && "Enter your email to receive a reset link."}
              {step === "confirm" && "Check your email for the reset link."}
              {step === "reset" && "Enter your new password."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "request" && (
              <form onSubmit={requestForm.handleSubmit(onRequest)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...requestForm.register("email")}
                    className="bg-background border-border"
                  />
                  {requestForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {requestForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  Send reset link
                </Button>
              </form>
            )}
            {step === "confirm" && (
              <p className="text-sm text-muted-foreground">
                If an account exists for that email, we've sent a link to reset your password.
              </p>
            )}
            {step === "reset" && (
              <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...resetForm.register("password")}
                    className="bg-background border-border"
                  />
                  {resetForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {resetForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    {...resetForm.register("confirmPassword")}
                    className="bg-background border-border"
                  />
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {resetForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  Reset password
                </Button>
              </form>
            )}
            <Link
              to="/login"
              className="mt-4 block text-center text-sm text-primary hover:underline"
            >
              Back to Login
            </Link>
          </CardContent>
        </Card>
      </AnimatedPage>
    </div>
  );
}
