import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-muted/30 p-6 md:p-12 lg:p-24">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community News</h1>
          <p className="text-muted-foreground mt-2">
            Latest announcements and updates from the building management.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Example Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Water Maintenance Warning</CardTitle>
              <CardDescription>Oct 24, 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Water will be shut off for 2 hours on Thursday due to scheduled
                pipe maintenance on block B.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/news/test-id">Read More &rarr;</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="pt-8">
          <Button asChild variant="outline">
            <Link href="/">&larr; Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
