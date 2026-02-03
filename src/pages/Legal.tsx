import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedPage } from "@/components/AnimatedPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LegalProps {
  title: string;
  content: React.ReactNode;
}

export function Legal({ title, content }: LegalProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar variant="landing" />
      <main className="flex-1 pt-14">
        <AnimatedPage>
          <div className="container px-4 py-12 md:px-6 md:py-16">
            <Card className="border-border bg-card max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle>{title}</CardTitle>
                <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                {content}
              </CardContent>
            </Card>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link to="/" className="text-primary hover:underline">Back to home</Link>
              {" · "}
              <a href="mailto:legal@clawcloud.com" className="text-primary hover:underline">Contact for legal inquiries</a>
            </p>
          </div>
        </AnimatedPage>
      </main>
      <Footer />
    </div>
  );
}
