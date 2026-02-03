import { Button } from "@/components/ui/button";
import { AnimatedPage } from "@/components/AnimatedPage";
import { AlertCircle, Mail } from "lucide-react";

interface ServerErrorProps {
  errorId?: string;
}

export function ServerError({ errorId }: ServerErrorProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <AnimatedPage className="w-full max-w-md text-center">
        <div className="rounded-full bg-destructive/10 p-4 w-fit mx-auto">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-muted-foreground">
          We're sorry. An internal error occurred. Please try again or contact support.
        </p>
        {errorId && (
          <p className="mt-2 text-sm text-muted-foreground">
            Error ID: <code className="rounded bg-muted px-1">{errorId}</code>
          </p>
        )}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
          <Button variant="outline" asChild>
            <a href="mailto:support@clawcloud.com" className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact support
            </a>
          </Button>
        </div>
      </AnimatedPage>
    </div>
  );
}
