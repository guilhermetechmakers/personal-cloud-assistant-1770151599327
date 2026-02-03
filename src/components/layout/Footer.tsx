import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const footerLinks = [
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
  { to: "/cookies", label: "Cookie Policy" },
  { to: "/help", label: "Help" },
];

export function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "border-t border-border bg-background py-8 md:py-12",
        className
      )}
    >
      <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} ClawCloud. All rights reserved.
        </p>
        <nav className="flex flex-wrap justify-center gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
