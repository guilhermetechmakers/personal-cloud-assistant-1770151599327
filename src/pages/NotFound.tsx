import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedPage } from "@/components/AnimatedPage";
import { Search, Home, HelpCircle, Mail } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <AnimatedPage className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-foreground">Page not found</h1>
        <p className="mt-4 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link to="/dashboard" className="inline-flex items-center gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/help" className="inline-flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Help
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/contact" className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Support
            </Link>
          </Button>
        </div>
        <div className="mt-8">
          <div className="relative max-w-xs mx-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 bg-card border-border"
            />
          </div>
        </div>
      </AnimatedPage>
    </div>
  );
}
