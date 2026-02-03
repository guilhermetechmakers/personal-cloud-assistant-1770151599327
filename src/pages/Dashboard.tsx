import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedPage } from "@/components/AnimatedPage";
import { Inbox, CheckSquare, MessageSquare, Clock } from "lucide-react";

export function Dashboard() {
  return (
    <AnimatedPage>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Your universal inbox and digest</p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-primary" />
              Today's Digest
            </CardTitle>
            <CardDescription>Top threads, action required, suggested replies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-border bg-background/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Top threads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground">No items</p>
                </CardContent>
              </Card>
              <Card className="border-border bg-background/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Action required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground">No pending approvals</p>
                </CardContent>
              </Card>
              <Card className="border-border bg-background/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Suggested replies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground">No drafts</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Run history
            </CardTitle>
            <CardDescription>Recent skill and automation runs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No runs yet. Install a Skill Pack to get started.</p>
            <Button className="mt-4" variant="outline">
              Browse Skill Library
            </Button>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
}
