import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedPage } from "@/components/AnimatedPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Book, MessageCircle, FileText } from "lucide-react";

export function Help() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar variant="landing" />
      <main className="flex-1 pt-14">
        <AnimatedPage>
          <div className="container px-4 py-12 md:px-6 md:py-16">
            <h1 className="text-3xl font-bold text-foreground text-center">About & Help</h1>
            <p className="mt-2 text-muted-foreground text-center max-w-xl mx-auto">
              Searchable docs, connector setup walkthroughs, FAQ, and support.
            </p>
            <div className="mt-8 max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search docs & guides..."
                  className="pl-9 bg-card border-border"
                />
              </div>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-border bg-card">
                <CardHeader>
                  <Book className="h-8 w-8 text-primary" />
                  <CardTitle>Docs & guides</CardTitle>
                  <CardDescription>Connector setup and Skill Studio guides</CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-border bg-card">
                <CardHeader>
                  <FileText className="h-8 w-8 text-primary" />
                  <CardTitle>FAQ</CardTitle>
                  <CardDescription>Frequently asked questions</CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-border bg-card">
                <CardHeader>
                  <MessageCircle className="h-8 w-8 text-primary" />
                  <CardTitle>Contact support</CardTitle>
                  <CardDescription>Get help from our team</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="support-email">Email</Label>
                      <Input id="support-email" type="email" placeholder="you@example.com" className="bg-background border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="support-message">Message</Label>
                      <Input id="support-message" placeholder="How can we help?" className="bg-background border-border" />
                    </div>
                    <Button type="submit" className="w-full">Send</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <p className="mt-8 text-center text-sm text-muted-foreground">
              <Link to="/" className="text-primary hover:underline">Back to home</Link>
            </p>
          </div>
        </AnimatedPage>
      </main>
      <Footer />
    </div>
  );
}
