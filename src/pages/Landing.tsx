import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedPage } from "@/components/AnimatedPage";
import {
  Plug,
  Package,
  Wand2,
  Globe,
  Shield,
  Inbox,
  Calendar,
  Plane,
} from "lucide-react";

const features = [
  {
    title: "Connectors",
    description: "Connect Gmail, Google Calendar, Slack, and more with OAuth.",
    icon: Plug,
  },
  {
    title: "Skill Packs",
    description: "Curated packs: Inbox Zero, Meeting Master, Travel Concierge.",
    icon: Package,
  },
  {
    title: "Skill Studio",
    description: "No-code builder to create and edit skills with templates.",
    icon: Wand2,
  },
  {
    title: "Web Agent",
    description: "Browser automation with approval checkpoints.",
    icon: Globe,
  },
  {
    title: "Trust & Controls",
    description: "Draft defaults, approvals, and immutable audit trails.",
    icon: Shield,
  },
];

const packs = [
  { name: "Inbox Zero", icon: Inbox, description: "Daily digest and draft replies." },
  { name: "Meeting Master", icon: Calendar, description: "Schedule and manage meetings." },
  { name: "Travel Concierge", icon: Plane, description: "Bookings and itineraries." },
];

export function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar variant="landing" />
      <main className="flex-1 pt-14">
        <AnimatedPage>
          <section className="container px-4 py-24 md:px-6 md:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                AI-driven assistants for email, calendar, and more
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Connect your cloud accounts, install Skill Packs, and run safe, auditable
                assistants. Trust-by-default with drafts and approvals.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="h-12 px-8">
                  <Link to="/login?signup=1">Sign up</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8">
                  <Link to="/login">Book demo</Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="border-t border-border bg-card/50 py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                Features
              </h2>
              <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((f) => {
                  const Icon = f.icon;
                  return (
                    <Card
                      key={f.title}
                      className="card-hover border-border bg-card transition-all duration-300"
                    >
                      <CardHeader>
                        <div className="rounded-lg bg-primary/10 p-3 w-fit">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{f.title}</CardTitle>
                        <CardDescription>{f.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                Packs showcase
              </h2>
              <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
                {packs.map((p) => {
                  const Icon = p.icon;
                  return (
                    <Card
                      key={p.name}
                      className="card-hover border-border bg-card"
                    >
                      <CardHeader>
                        <Icon className="h-8 w-8 text-primary" />
                        <CardTitle className="text-lg">{p.name}</CardTitle>
                        <CardDescription>{p.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="border-t border-border py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-8 text-center">
                <h2 className="text-xl font-semibold text-foreground">
                  Pricing teaser
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Free • Pro • Teams — plans for every need.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/login">Get started</Link>
                </Button>
              </div>
            </div>
          </section>
        </AnimatedPage>
      </main>
      <Footer />
    </div>
  );
}
